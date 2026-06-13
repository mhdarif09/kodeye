import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { InstallationEventHandler } from './handlers/installation-event.handler';
import { InstallationRepositoriesEventHandler } from './handlers/installation-repositories-event.handler';
import { PullRequestEventHandler } from './handlers/pull-request-event.handler';
import { PushEventHandler } from './handlers/push-event.handler';
import { RepositoryEventHandler } from './handlers/repository-event.handler';
import type { SupportedGitHubWebhookEvent } from './types/github-webhook-event.type';
import type { GitHubWebhookPayload } from './types/github-webhook-payload.type';
import { AppSettingsService } from '../../settings/app-settings.service';

const supported = new Set<SupportedGitHubWebhookEvent>([
  'installation',
  'installation_repositories',
  'pull_request',
  'push',
  'repository',
]);

@Injectable()
export class GitHubWebhookService {
  constructor(
    private readonly config: AppSettingsService,
    private readonly installation: InstallationEventHandler,
    private readonly installationRepositories: InstallationRepositoriesEventHandler,
    private readonly pullRequest: PullRequestEventHandler,
    private readonly push: PushEventHandler,
    private readonly repository: RepositoryEventHandler,
    private readonly prisma: PrismaService,
  ) {}

  async process(
    eventName: string,
    deliveryId: string,
    payload: GitHubWebhookPayload,
  ) {
    const created = await this.trackDelivery(eventName, deliveryId, payload);
    if (!created) return { status: 'duplicate' };
    if (!enabled(this.config, 'GITHUB_WEBHOOK_ENABLED', true)) {
      await this.complete(deliveryId, 'disabled');
      return { status: 'disabled' };
    }
    if (!supported.has(eventName as SupportedGitHubWebhookEvent)) {
      await this.complete(deliveryId, 'ignored');
      return { status: 'ignored' };
    }

    try {
      const status = await this.dispatch(
        eventName as SupportedGitHubWebhookEvent,
        payload,
        deliveryId,
      );
      await this.complete(deliveryId, status);
      return { status };
    } catch {
      await this.prisma.gitHubWebhookDelivery.update({
        data: {
          errorMessage: 'Webhook processing failed',
          processedAt: new Date(),
          status: 'failed',
        },
        where: { deliveryId },
      });
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }

  private dispatch(
    eventName: SupportedGitHubWebhookEvent,
    payload: GitHubWebhookPayload,
    deliveryId: string,
  ) {
    switch (eventName) {
      case 'push':
        return this.push.handle(payload, deliveryId);
      case 'pull_request':
        return this.pullRequest.handle(payload, deliveryId);
      case 'repository':
        return this.repository.handle(payload);
      case 'installation':
        return this.installation.handle(payload);
      case 'installation_repositories':
        return this.installationRepositories.handle(payload);
    }
  }

  private async trackDelivery(
    eventName: string,
    deliveryId: string,
    payload: GitHubWebhookPayload,
  ) {
    try {
      await this.prisma.gitHubWebhookDelivery.create({
        data: {
          action: payload.action,
          deliveryId,
          eventName: eventName.slice(0, 100),
          repositoryFullName: payload.repository?.full_name,
          status: 'received',
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        return false;
      throw error;
    }
  }

  private complete(deliveryId: string, status: string) {
    return this.prisma.gitHubWebhookDelivery.update({
      data: { processedAt: new Date(), status },
      where: { deliveryId },
    });
  }
}

function enabled(config: AppSettingsService, name: string, fallback: boolean) {
  const value = config.get<string | boolean>(name);
  return value === undefined ? fallback : value === true || value === 'true';
}
