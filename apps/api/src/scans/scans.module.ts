import { Module } from '@nestjs/common';

import { RepositoriesModule } from '../repositories/repositories.module';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';
import { BillingModule } from '../billing/billing.module';

@Module({
  controllers: [ScansController],
  imports: [RepositoriesModule, BillingModule],
  providers: [ScansService],
})
export class ScansModule {}
