import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';

import { OrganizationsModule } from '../organizations/organizations.module';
import { GitHubAppService } from './github-app.service';
import { GitHubAuthController } from './github-auth.controller';
import { GitHubOAuthService } from './github-oauth.service';
import { GitHubController } from './github.controller';
import { GitHubService } from './github.service';
import { GitHubChecksService } from './checks/github-checks.service';
import { GitHubWebhookController } from './webhook/github-webhook.controller';
import { GitHubWebhookService } from './webhook/github-webhook.service';
import { GitHubWebhookSignatureService } from './webhook/github-webhook-signature.service';
import { InstallationEventHandler } from './webhook/handlers/installation-event.handler';
import { InstallationRepositoriesEventHandler } from './webhook/handlers/installation-repositories-event.handler';
import { PullRequestEventHandler } from './webhook/handlers/pull-request-event.handler';
import { PushEventHandler } from './webhook/handlers/push-event.handler';
import { RepositoryEventHandler } from './webhook/handlers/repository-event.handler';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('JWT_EXPIRES_IN'),
        },
      }),
    }),
    OrganizationsModule,
    BillingModule,
  ],
  controllers: [
    GitHubAuthController,
    GitHubController,
    GitHubWebhookController,
  ],
  providers: [
    GitHubAppService,
    GitHubChecksService,
    GitHubOAuthService,
    GitHubService,
    GitHubWebhookService,
    GitHubWebhookSignatureService,
    InstallationEventHandler,
    InstallationRepositoriesEventHandler,
    PullRequestEventHandler,
    PushEventHandler,
    RepositoryEventHandler,
  ],
})
export class GitHubModule {}
