import { Injectable } from '@nestjs/common';
import { ScanStatus, ScanTriggerType } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { GitHubChecksService } from '../../checks/github-checks.service';
import type { GitHubWebhookPayload } from '../types/github-webhook-payload.type';
import { BillingService } from '../../../billing/services/billing.service';
import { AppSettingsService } from '../../../settings/app-settings.service';

@Injectable()
export class PushEventHandler {
  constructor(
    private readonly config: AppSettingsService,
    private readonly checks: GitHubChecksService,
    private readonly prisma: PrismaService,
    private readonly billing: BillingService,
  ) {}

  async handle(payload: GitHubWebhookPayload, deliveryId: string) {
    if (!enabled(this.config, 'GITHUB_WEBHOOK_ENABLED', true))
      return 'disabled';
    if (!enabled(this.config, 'AUTO_SCAN_PUSH_ENABLED', true))
      return 'disabled';
    if (!payload.repository || !payload.after || !payload.ref) return 'ignored';
    if (!payload.ref.startsWith('refs/heads/')) return 'ignored';

    const repository = await this.prisma.repository.findFirst({
      where: {
        autoScanPushEnabled: true,
        githubRepoId: payload.repository.id.toString(),
        isArchived: false,
        isConnected: true,
        provider: 'GITHUB',
      },
    });
    if (!repository) return 'ignored';
    try {
      await this.billing.assertLimits(repository.organizationId, 'auto');
      await this.billing.assertLimits(repository.organizationId, 'scan');
    } catch {
      return 'plan_limit';
    }
    const branch = payload.ref.slice('refs/heads/'.length);
    if (branch !== repository.defaultBranch) return 'ignored';
    const installation = await this.prisma.gitHubInstallation.findFirst({
      where: { organizationId: repository.organizationId },
    });
    if (!installation) return 'ignored';

    const existing = await this.prisma.scanJob.findFirst({
      where: {
        commitSha: payload.after,
        repositoryId: repository.id,
        triggerType: ScanTriggerType.GITHUB_PUSH,
      },
    });
    if (existing) return 'duplicate';

    const scan = await this.prisma.scanJob.create({
      data: {
        branch,
        commitSha: payload.after,
        organizationId: repository.organizationId,
        repositoryId: repository.id,
        status: ScanStatus.PENDING,
        triggerType: ScanTriggerType.GITHUB_PUSH,
        webhookDeliveryId: deliveryId,
      },
    });
    await this.createCheck(
      installation.installationId,
      repository.fullName ?? payload.repository.full_name,
      payload.after,
      scan.id,
    );
    return 'processed';
  }

  private async createCheck(
    installationId: string,
    fullName: string,
    sha: string,
    scanId: string,
  ) {
    try {
      const check = await this.checks.create(
        installationId,
        fullName,
        sha,
        scanId,
      );
      await this.prisma.scanJob.update({
        data: {
          githubCheckRunId: check.id.toString(),
          githubCheckUrl: check.html_url,
        },
        where: { id: scanId },
      });
    } catch {
      await this.prisma.scanLog.create({
        data: {
          level: 'warn',
          message:
            'GitHub Check Run could not be created. Verify Checks permission.',
          scanJobId: scanId,
        },
      });
    }
  }
}

function enabled(config: AppSettingsService, name: string, fallback: boolean) {
  const value = config.get<string | boolean>(name);
  return value === undefined ? fallback : value === true || value === 'true';
}
