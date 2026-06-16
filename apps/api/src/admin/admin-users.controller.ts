import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateAdminUserRoleDto } from './dto/update-admin-user-role.dto';
import { AdminUsersService } from './services/admin-users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  list(@Query() query: AdminUsersQueryDto) {
    return this.users.list(query);
  }

  @Patch(':id/role')
  updateRole(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') userId: string,
    @Body() dto: UpdateAdminUserRoleDto,
  ) {
    return this.users.updateRole(actor.id, userId, dto.role);
  }

  @Patch(':id/suspend')
  suspend(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') userId: string,
  ) {
    return this.users.suspend(actor.id, userId);
  }

  @Patch(':id/reactivate')
  reactivate(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') userId: string,
  ) {
    return this.users.reactivate(actor.id, userId);
  }

  @Delete(':id')
  delete(@CurrentUser() actor: AuthenticatedUser, @Param('id') userId: string) {
    return this.users.delete(actor.id, userId);
  }
}
