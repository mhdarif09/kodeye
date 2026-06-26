import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import { validateEnvironment } from './config/env.validation';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';
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
    AdminModule,
    BlogModule,
    PortfolioModule,
    TeamModule,
    PartnerModule,
  ],
})
export class AppModule {}
