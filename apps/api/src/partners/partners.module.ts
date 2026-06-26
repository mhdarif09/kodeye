import { Module } from '@nestjs/common';

import { PartnerController } from './partners.controller';
import { PartnerService } from './partners.service';

@Module({
  controllers: [PartnerController],
  exports: [PartnerService],
  providers: [PartnerService],
})
export class PartnerModule {}
