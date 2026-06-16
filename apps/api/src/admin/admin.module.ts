import { Module } from '@nestjs/common';

import { AdminAuditController } from './admin-audit.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminProvidersController } from './admin-providers.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminUsersService } from './services/admin-users.service';
import { ProviderTestService } from './services/provider-test.service';

@Module({
  controllers: [
    AdminAuditController,
    AdminDashboardController,
    AdminProvidersController,
    AdminUsersController,
  ],
  providers: [
    AdminAuditService,
    AdminDashboardService,
    AdminUsersService,
    ProviderTestService,
  ],
})
export class AdminModule {}
