import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [OrganizationsModule, BillingModule],
  controllers: [RepositoriesController],
  exports: [RepositoriesService],
  providers: [RepositoriesService],
})
export class RepositoriesModule {}
