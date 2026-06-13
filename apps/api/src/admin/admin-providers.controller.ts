import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { IsIn } from 'class-validator';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { ProviderTestService } from './services/provider-test.service';

class TestProviderDto {
  @IsIn(['github', 'midtrans', 'paypal', 'currency'])
  provider!: 'github' | 'midtrans' | 'paypal' | 'currency';
}

@Controller('admin/providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProvidersController {
  constructor(private readonly providers: ProviderTestService) {}

  @Post('test')
  test(@CurrentUser() user: AuthenticatedUser, @Body() dto: TestProviderDto) {
    return this.providers.test(dto.provider, user.id);
  }
}
