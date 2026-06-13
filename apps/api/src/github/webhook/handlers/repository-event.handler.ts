import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { GitHubWebhookPayload } from '../types/github-webhook-payload.type';

@Injectable()
export class RepositoryEventHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(payload: GitHubWebhookPayload) {
    if (!payload.repository) return 'ignored';
    const repository = await this.prisma.repository.findFirst({
      where: {
        githubRepoId: payload.repository.id.toString(),
        provider: 'GITHUB',
      },
    });
    if (!repository) return 'ignored';
    await this.prisma.repository.update({
      data: {
        defaultBranch:
          payload.repository.default_branch ?? repository.defaultBranch,
        fullName: payload.repository.full_name,
        htmlUrl: payload.repository.html_url ?? repository.htmlUrl,
        isArchived:
          payload.action === 'archived' || Boolean(payload.repository.archived),
        isConnected: payload.action !== 'deleted',
        isPrivate: payload.repository.private ?? repository.isPrivate,
        name: payload.repository.name,
        repoUrl: payload.repository.clone_url ?? repository.repoUrl,
      },
      where: { id: repository.id },
    });
    return 'processed';
  }
}
