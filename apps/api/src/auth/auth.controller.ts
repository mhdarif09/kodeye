import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { ResponsePayload } from '../common/interceptors/response.interceptor';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<ResponsePayload<unknown>> {
    return {
      message: 'Registration successful',
      data: await this.authService.register(dto),
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ResponsePayload<unknown>> {
    return {
      message: 'Login successful',
      data: await this.authService.login(dto),
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.id);
  }
}
