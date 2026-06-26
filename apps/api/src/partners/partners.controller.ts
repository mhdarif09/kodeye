import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  CreateTrustedCompanyDto,
  UpdateTrustedCompanyDto,
} from './dto/partners.dto';
import { PartnerService } from './partners.service';

@Controller()
export class PartnerController {
  constructor(private readonly partner: PartnerService) {}

  @Get('partners/companies')
  listPublished() {
    return this.partner.listPublished();
  }

  @Get('admin/partners/companies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listAdmin() {
    return this.partner.listAdmin();
  }

  @Post('admin/partners/companies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createAdmin(@Body() dto: CreateTrustedCompanyDto) {
    return this.partner.createAdmin(dto);
  }

  @Patch('admin/partners/companies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateTrustedCompanyDto,
  ) {
    return this.partner.updateAdmin(id, dto);
  }

  @Delete('admin/partners/companies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteAdmin(@Param('id') id: string) {
    return this.partner.deleteAdmin(id);
  }
}
