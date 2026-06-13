import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminAuditService } from './services/admin-audit.service';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAuditController {
  constructor(private readonly audit: AdminAuditService) {}

  @Get()
  list(
    @Query('action') action?: AuditAction,
    @Query('actorUserId') actorUserId?: string,
    @Query('resourceKey') resourceKey?: string,
    @Query('resourceType') resourceType?: string,
    @Query('search') search?: string,
    @Query('take') take?: string,
  ) {
    return this.audit.list({
      action,
      actorUserId,
      resourceKey,
      resourceType,
      search,
      take: take ? Number(take) : undefined,
    });
  }
}
