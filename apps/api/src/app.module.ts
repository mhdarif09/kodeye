import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import { validateEnvironment } from './config/env.validation';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { GitHubModule } from './github/github.module';
import { ScansModule } from './scans/scans.module';
import { ReportsModule } from './reports/reports.module';
import { BillingModule } from './billing/billing.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { SalesModule } from './sales/sales.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { BlogModule } from './blog/blog.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { TeamModule } from './team/team.module';
import { PartnerModule } from './partners/partners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../../.env', '.env'],
      isGlobal: true,
      load: [appConfig],
      validate: validateEnvironment,
    }),
    PrismaModule,
    SettingsModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    RepositoriesModule,
    GitHubModule,
    ScansModule,
    ReportsModule,
    BillingModule,
    AdminModule,
    AiModule,
    SalesModule,
    WorkspacesModule,
    BlogModule,
    PortfolioModule,
    TeamModule,
    PartnerModule,
  ],
})
export class AppModule {}
