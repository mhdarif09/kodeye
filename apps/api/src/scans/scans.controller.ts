import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { CreateScanDto } from './dto/create-scan.dto';
import { ListFindingsQueryDto } from './dto/list-findings-query.dto';
import { ListScansQueryDto } from './dto/list-scans-query.dto';
import { ScansService } from './scans.service';

@ApiBearerAuth()
@ApiTags('Scans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post('repositories/:id/scans')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') repositoryId: string,
    @Body() dto: CreateScanDto,
  ) {
    return this.scansService.create(user.id, repositoryId, dto);
  }

  @Get('scans')
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListScansQueryDto,
  ) {
    return this.scansService.findAll(user.id, query);
  }

  @Get('scans/:id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') scanId: string) {
    return this.scansService.findOne(user.id, scanId);
  }

  @Get('scans/:id/findings')
  findings(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') scanId: string,
    @Query() query: ListFindingsQueryDto,
  ) {
    return this.scansService.findFindings(user.id, scanId, query);
  }

  @Get('scans/:id/logs')
  logs(@CurrentUser() user: AuthenticatedUser, @Param('id') scanId: string) {
    return this.scansService.findLogs(user.id, scanId);
  }
}
