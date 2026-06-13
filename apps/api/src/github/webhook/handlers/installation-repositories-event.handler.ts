import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type {
  GitHubWebhookPayload,
  WebhookRepository,
} from '../types/github-webhook-payload.type';

@Injectable()
export class InstallationRepositoriesEventHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(payload: GitHubWebhookPayload) {
    if (!payload.installation) return 'ignored';
    const installation = await this.prisma.gitHubInstallation.findUnique({
      where: { installationId: payload.installation.id.toString() },
    });
    if (!installation) return 'ignored';

    for (const repository of payload.repositories_added ?? []) {
      await this.upsert(installation.organizationId, repository);
    }
    const removedIds = (payload.repositories_removed ?? []).map((item) =>
      item.id.toString(),
    );
    if (removedIds.length) {
      await this.prisma.repository.updateMany({
        data: { isConnected: false },
        where: {
          githubRepoId: { in: removedIds },
          organizationId: installation.organizationId,
        },
      });
    }
    return 'processed';
  }

  private async upsert(organizationId: string, repository: WebhookRepository) {
    const existing = await this.prisma.repository.findFirst({
      where: {
        organizationId,
        OR: [
          { githubRepoId: repository.id.toString() },
          { name: repository.name },
        ],
      },
    });
    const data = {
      defaultBranch: repository.default_branch ?? 'main',
      fullName: repository.full_name,
      githubRepoId: repository.id.toString(),
      htmlUrl: repository.html_url,
      isArchived: Boolean(repository.archived),
      isConnected: true,
      isPrivate: Boolean(repository.private),
      name: repository.name,
      organizationId,
      provider: 'GITHUB' as const,
      repoUrl: repository.clone_url ?? repository.html_url,
    };
    return existing
      ? this.prisma.repository.update({ data, where: { id: existing.id } })
      : this.prisma.repository.create({ data });
  }
}
