import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { GitHubInstallCallbackDto } from './dto/github-install-callback.dto';
import { GitHubInstallQueryDto } from './dto/github-install-query.dto';
import { GitHubRepositoriesQueryDto } from './dto/github-repositories-query.dto';
import { SyncGitHubRepositoriesDto } from './dto/sync-github-repositories.dto';
import { GitHubService } from './github.service';
import { AppSettingsService } from '../settings/app-settings.service';

@ApiTags('GitHub')
@Controller('github')
export class GitHubController {
  constructor(
    private readonly configService: AppSettingsService,
    private readonly githubService: GitHubService,
  ) {}

  @Get('install')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  install(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GitHubInstallQueryDto,
  ) {
    return this.githubService.prepareInstallation(
      user.id,
      query.organizationId,
    );
  }

  @Get('install/callback')
  async installCallback(
    @Query() query: GitHubInstallCallbackDto,
    @Res() response: Response,
  ): Promise<void> {
    await this.githubService.completeInstallation(query);
    const frontendUrl = new URL(
      this.configService.get<string>(
        'FRONTEND_GITHUB_INTEGRATION_URL',
        'http://localhost:3000/dashboard/integrations/github',
      ),
    );
    frontendUrl.searchParams.set('status', 'connected');
    frontendUrl.searchParams.set('installation_id', query.installation_id);
    frontendUrl.searchParams.set('setup_action', query.setup_action);
    response.redirect(frontendUrl.toString());
  }

  @Get('installations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  installations(@CurrentUser() user: AuthenticatedUser) {
    return this.githubService.findInstallations(user.id);
  }

  @Post('repositories/sync')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  syncRepositories(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SyncGitHubRepositoriesDto,
  ) {
    return this.githubService.syncRepositories(user.id, dto);
  }

  @Get('repositories')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  repositories(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GitHubRepositoriesQueryDto,
  ) {
    return this.githubService.findRepositories(user.id, query);
  }
}
