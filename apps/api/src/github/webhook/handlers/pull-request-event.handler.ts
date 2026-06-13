import { Injectable } from '@nestjs/common';
import { ScanStatus, ScanTriggerType } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { GitHubChecksService } from '../../checks/github-checks.service';
import type { GitHubWebhookPayload } from '../types/github-webhook-payload.type';
import { BillingService } from '../../../billing/services/billing.service';
import { AppSettingsService } from '../../../settings/app-settings.service';

const supportedActions = new Set([
  'opened',
  'synchronize',
  'reopened',
  'ready_for_review',
]);

@Injectable()
export class PullRequestEventHandler {
  constructor(
    private readonly config: AppSettingsService,
    private readonly checks: GitHubChecksService,
    private readonly prisma: PrismaService,
    private readonly billing: BillingService,
  ) {}

  async handle(payload: GitHubWebhookPayload, deliveryId: string) {
    if (!enabled(this.config, 'GITHUB_WEBHOOK_ENABLED', true))
      return 'disabled';
    if (!enabled(this.config, 'AUTO_SCAN_PULL_REQUEST_ENABLED', true))
      return 'disabled';
    if (
      !payload.action ||
      !supportedActions.has(payload.action) ||
      !payload.repository ||
      !payload.pull_request
    )
      return 'ignored';
    if (payload.pull_request.draft && payload.action !== 'ready_for_review')
      return 'ignored';

    const repository = await this.prisma.repository.findFirst({
      where: {
        autoScanPullRequestEnabled: true,
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
    const installation = await this.prisma.gitHubInstallation.findFirst({
      where: { organizationId: repository.organizationId },
    });
    if (!installation) return 'ignored';
    const pullRequestNumber = payload.number ?? payload.pull_request.number;
    if (!pullRequestNumber) return 'ignored';
    const commitSha = payload.pull_request.head.sha;

    const existing = await this.prisma.scanJob.findFirst({
      where: { commitSha, pullRequestNumber, repositoryId: repository.id },
    });
    if (existing) return 'duplicate';

    const scan = await this.prisma.scanJob.create({
      data: {
        branch: payload.pull_request.head.ref,
        commitSha,
        organizationId: repository.organizationId,
        pullRequestNumber,
        repositoryId: repository.id,
        status: ScanStatus.PENDING,
        triggerType: ScanTriggerType.GITHUB_PULL_REQUEST,
        webhookDeliveryId: deliveryId,
      },
    });
    try {
      const check = await this.checks.create(
        installation.installationId,
        repository.fullName ?? payload.repository.full_name,
        commitSha,
        scan.id,
      );
      await this.prisma.scanJob.update({
        data: {
          githubCheckRunId: check.id.toString(),
          githubCheckUrl: check.html_url,
        },
        where: { id: scan.id },
      });
    } catch {
      await this.prisma.scanLog.create({
        data: {
          level: 'warn',
          message:
            'GitHub Check Run could not be created. Verify Checks permission.',
          scanJobId: scan.id,
        },
      });
    }
    return 'processed';
  }
}

function enabled(config: AppSettingsService, name: string, fallback: boolean) {
  const value = config.get<string | boolean>(name);
  return value === undefined ? fallback : value === true || value === 'true';
}
