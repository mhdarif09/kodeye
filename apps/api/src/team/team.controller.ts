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
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
} from './dto/team.dto';
import { TeamService } from './team.service';

@Controller()
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get('team/members')
  listPublished() {
    return this.team.listPublished();
  }

  @Get('admin/team/members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listAdmin() {
    return this.team.listAdmin();
  }

  @Post('admin/team/members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createAdmin(@Body() dto: CreateTeamMemberDto) {
    return this.team.createAdmin(dto);
  }

  @Patch('admin/team/members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.team.updateAdmin(id, dto);
  }

  @Delete('admin/team/members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteAdmin(@Param('id') id: string) {
    return this.team.deleteAdmin(id);
  }
}
