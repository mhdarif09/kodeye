import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { GitHubWebhookPayload } from '../types/github-webhook-payload.type';

@Injectable()
export class InstallationEventHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(payload: GitHubWebhookPayload) {
    if (!payload.installation) return 'ignored';
    const installationId = payload.installation.id.toString();
    const installation = await this.prisma.gitHubInstallation.findUnique({
      where: { installationId },
    });
    if (!installation) return 'ignored';
    if (payload.action === 'deleted') {
      await this.prisma.$transaction([
        this.prisma.repository.updateMany({
          data: { isConnected: false },
          where: {
            organizationId: installation.organizationId,
            provider: 'GITHUB',
          },
        }),
        this.prisma.gitHubInstallation.delete({ where: { installationId } }),
      ]);
      return 'processed';
    }
    if (payload.action === 'suspend') {
      await this.prisma.repository.updateMany({
        data: { isConnected: false },
        where: {
          organizationId: installation.organizationId,
          provider: 'GITHUB',
        },
      });
      return 'processed';
    }
    if (payload.action === 'unsuspend') {
      await this.prisma.repository.updateMany({
        data: { isConnected: true },
        where: {
          organizationId: installation.organizationId,
          provider: 'GITHUB',
        },
      });
      return 'processed';
    }
    return 'ignored';
  }
}
