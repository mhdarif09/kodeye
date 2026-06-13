import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SettingCategory, UserRole } from '@prisma/client';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import type { Request } from 'express';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AppSettingsService } from './app-settings.service';

class UpdateSettingsDto {
  @IsObject() settings!: Record<string, string | null>;
}

class PatchSettingDto {
  @IsString() value!: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SettingsController {
  constructor(private readonly settings: AppSettingsService) {}

  @Get()
  list(@Query('category') category?: SettingCategory, @Query('search') search?: string) {
    return this.settings.list(category, search);
  }

  @Put()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settings.bulkUpdate(dto.settings, requestContext(user, request));
  }

  @Post('reload')
  reload(@CurrentUser() user: AuthenticatedUser, @Req() request: Request) {
    return this.settings.auditReload(requestContext(user, request));
  }

  @Get(':key')
  getOne(@Param('key') key: string) {
    return this.settings.getPublicSetting(key);
  }

  @Patch()
  bulkUpdate(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settings.bulkUpdate(dto.settings, requestContext(user, request));
  }

  @Patch(':key')
  updateOne(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Param('key') key: string,
    @Body() dto: PatchSettingDto,
  ) {
    return this.settings.updateOne(
      key,
      dto.value,
      dto.isActive,
      requestContext(user, request),
    );
  }

  @Post(':key/clear-secret')
  clearSecret(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Param('key') key: string,
  ) {
    return this.settings.clearSecret(key, requestContext(user, request));
  }
}

function requestContext(user: AuthenticatedUser, request: Request) {
  return {
    actorUserId: user.id,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  };
}
