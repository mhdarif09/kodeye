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
  CreatePortfolioProjectDto,
  UpdatePortfolioProjectDto,
} from './dto/portfolio.dto';
import { PortfolioService } from './portfolio.service';

@Controller()
export class PortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  @Get('portfolio/projects')
  listPublished() {
    return this.portfolio.listPublished();
  }

  @Get('admin/portfolio/projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listAdmin() {
    return this.portfolio.listAdmin();
  }

  @Post('admin/portfolio/projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createAdmin(@Body() dto: CreatePortfolioProjectDto) {
    return this.portfolio.createAdmin(dto);
  }

  @Patch('admin/portfolio/projects/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdatePortfolioProjectDto,
  ) {
    return this.portfolio.updateAdmin(id, dto);
  }

  @Delete('admin/portfolio/projects/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteAdmin(@Param('id') id: string) {
    return this.portfolio.deleteAdmin(id);
  }
}
