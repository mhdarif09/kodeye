import { Module } from '@nestjs/common';

import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  controllers: [OrganizationsController],
  exports: [OrganizationsService],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
