import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AiService } from './ai.service';
import { CreateFixPullRequestDto } from './dto/create-fix-pull-request.dto';
import { GenerateFindingFixDto } from './dto/generate-finding-fix.dto';
import { ReviewFindingDto } from './dto/review-finding.dto';

@ApiBearerAuth()
@ApiTags('AI Workspace')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('findings/:id/review')
  reviewFinding(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') findingId: string,
    @Body() dto: ReviewFindingDto,
  ) {
    return this.aiService.reviewFinding(user.id, findingId, dto);
  }

  @Post('findings/:id/fix')
  generateFix(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') findingId: string,
    @Body() dto: GenerateFindingFixDto,
  ) {
    return this.aiService.generateFix(user.id, findingId, dto);
  }

  @Post('findings/:id/fix/pull-request')
  createFixPullRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') findingId: string,
    @Body() dto: CreateFixPullRequestDto,
  ) {
    return this.aiService.createFixPullRequest(user.id, findingId, dto);
  }
}
