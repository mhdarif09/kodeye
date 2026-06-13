import { BadRequestException, Injectable } from '@nestjs/common';
import { ScanStatus, ScanTriggerType } from '@prisma/client';

import { BillingService } from '../billing/services/billing.service';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AppSettingsService } from '../settings/app-settings.service';

@Injectable()
export class GitHubInitialAuditService {
  constructor(
    private readonly billing: BillingService,
    private readonly config: AppSettingsService,
    private readonly prisma: PrismaService,
  ) {}

  async queue(repositoryId: string): Promise<boolean> {
    if (!this.config.getBoolean('AUTO_SCAN_ON_SYNC_ENABLED', true))
      return false;

    const repository = await this.prisma.repository.findUnique({
      where: { id: repositoryId },
    });
    if (!repository || !repository.isConnected || repository.isArchived) {
      return false;
    }

    const activeScan = await this.prisma.scanJob.findFirst({
      where: {
        repositoryId,
        status: { in: [ScanStatus.PENDING, ScanStatus.RUNNING] },
      },
    });
    if (activeScan) return false;

    try {
      await this.billing.assertLimits(repository.organizationId, 'scan');
    } catch (error) {
      if (error instanceof BadRequestException) return false;
      throw error;
    }

    await this.prisma.scanJob.create({
      data: {
        branch: repository.defaultBranch,
        scanLogs: {
          create: {
            level: 'info',
            message:
              'Initial full-repository audit queued after GitHub synchronization.',
          },
        },
        organizationId: repository.organizationId,
        repositoryId,
        status: ScanStatus.PENDING,
        triggerType: ScanTriggerType.GITHUB_SYNC,
      },
    });
    return true;
  }
}
