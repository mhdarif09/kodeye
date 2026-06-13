import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { ListRepositoriesQueryDto } from './dto/list-repositories-query.dto';
import { UpdateAutomationSettingsDto } from './dto/update-automation-settings.dto';
import { RepositoriesService } from './repositories.service';

@ApiBearerAuth()
@ApiTags('Repositories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListRepositoriesQueryDto,
  ) {
    return this.repositoriesService.findAllForUser(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRepositoryDto,
  ) {
    return this.repositoriesService.create(user.id, dto);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') repositoryId: string,
  ) {
    return this.repositoriesService.findAccessibleById(user.id, repositoryId);
  }

  @Patch(':id/automation-settings')
  updateAutomationSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') repositoryId: string,
    @Body() dto: UpdateAutomationSettingsDto,
  ) {
    return this.repositoriesService.updateAutomationSettings(
      user.id,
      repositoryId,
      dto,
    );
  }
}
