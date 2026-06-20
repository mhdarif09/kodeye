import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { CreateWorkspaceFileDto } from './dto/create-workspace-file.dto';
import { RenameWorkspaceFileDto } from './dto/rename-workspace-file.dto';
import { WorkspaceFileQueryDto } from './dto/workspace-file-query.dto';
import { WriteWorkspaceFileDto } from './dto/write-workspace-file.dto';
import { WorkspacesService } from './workspaces.service';

@ApiBearerAuth()
@ApiTags('Workspaces')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.workspacesService.findAll(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.workspacesService.findOne(user.id, id);
  }

  @Get(':id/files')
  listFiles(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query() query: WorkspaceFileQueryDto,
  ) {
    return this.workspacesService.listFiles(user.id, id, query.path);
  }

  @Get(':id/files/content')
  readFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query() query: WorkspaceFileQueryDto,
  ) {
    return this.workspacesService.readFile(user.id, id, query.path ?? '');
  }

  @Put(':id/files/content')
  writeFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: WriteWorkspaceFileDto,
  ) {
    return this.workspacesService.writeFile(user.id, id, dto);
  }

  @Post(':id/files')
  createFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateWorkspaceFileDto,
  ) {
    return this.workspacesService.createFile(user.id, id, dto);
  }

  @Delete(':id/files')
  deleteFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query() query: WorkspaceFileQueryDto,
  ) {
    return this.workspacesService.deleteFile(user.id, id, query.path ?? '');
  }

  @Patch(':id/files/rename')
  renameFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RenameWorkspaceFileDto,
  ) {
    return this.workspacesService.renameFile(user.id, id, dto);
  }
}
