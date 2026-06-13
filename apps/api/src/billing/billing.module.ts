import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { ReportsModule } from '../reports/reports.module';
import { BillingController } from './billing.controller';
import { PaymentProvidersService } from './providers/payment-providers.service';
import { BillingService } from './services/billing.service';
import { ExchangeRateService } from './services/exchange-rate.service';

@Module({
  controllers: [BillingController],
  exports: [BillingService],
  imports: [OrganizationsModule, ReportsModule],
  providers: [BillingService, ExchangeRateService, PaymentProvidersService],
})
export class BillingModule {}
