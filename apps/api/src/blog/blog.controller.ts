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

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

@Controller()
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get('blog/posts')
  listPublished() {
    return this.blog.listPublished();
  }

  @Get('blog/posts/:slug')
  findPublished(@Param('slug') slug: string) {
    return this.blog.findPublishedBySlug(slug);
  }

  @Get('admin/blog/posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listAdmin() {
    return this.blog.listAdmin();
  }

  @Post('admin/blog/posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createAdmin(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBlogPostDto,
  ) {
    return this.blog.createAdmin(user.id, dto);
  }

  @Patch('admin/blog/posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAdmin(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blog.updateAdmin(id, dto);
  }

  @Delete('admin/blog/posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteAdmin(@Param('id') id: string) {
    return this.blog.deleteAdmin(id);
  }
}
