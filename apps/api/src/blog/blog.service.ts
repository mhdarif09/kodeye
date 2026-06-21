import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogPostStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

const BLOG_SELECT = {
  author: { select: { email: true, id: true, name: true } },
  content: true,
  createdAt: true,
  excerpt: true,
  id: true,
  metaDescription: true,
  metaTitle: true,
  publishedAt: true,
  slug: true,
  status: true,
  title: true,
  updatedAt: true,
} satisfies Prisma.BlogPostSelect;

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished() {
    return this.prisma.blogPost.findMany({
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: BLOG_SELECT,
      where: { status: BlogPostStatus.PUBLISHED },
    });
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      select: BLOG_SELECT,
      where: { slug: normalizeSlug(slug), status: BlogPostStatus.PUBLISHED },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  listAdmin() {
    return this.prisma.blogPost.findMany({
      orderBy: { updatedAt: 'desc' },
      select: BLOG_SELECT,
    });
  }

  async createAdmin(authorUserId: string, dto: CreateBlogPostDto) {
    const status = dto.status;
    try {
      return await this.prisma.blogPost.create({
        data: {
          authorUserId,
          content: dto.content,
          excerpt: dto.excerpt.trim(),
          metaDescription: dto.metaDescription?.trim() || null,
          metaTitle: dto.metaTitle?.trim() || null,
          publishedAt: status === BlogPostStatus.PUBLISHED ? new Date() : null,
          slug: normalizeSlug(dto.slug || dto.title),
          status,
          title: dto.title.trim(),
        },
        select: BLOG_SELECT,
      });
    } catch (error) {
      if (isUniqueConflict(error)) throw new ConflictException('Slug exists');
      throw error;
    }
  }

  async updateAdmin(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    const nextStatus = dto.status ?? existing.status;
    const shouldPublish =
      nextStatus === BlogPostStatus.PUBLISHED && !existing.publishedAt;
    try {
      return await this.prisma.blogPost.update({
        data: {
          ...(dto.content !== undefined ? { content: dto.content } : {}),
          ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt.trim() } : {}),
          ...(dto.metaDescription !== undefined
            ? { metaDescription: dto.metaDescription.trim() || null }
            : {}),
          ...(dto.metaTitle !== undefined
            ? { metaTitle: dto.metaTitle.trim() || null }
            : {}),
          ...(dto.slug !== undefined ? { slug: normalizeSlug(dto.slug) } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          publishedAt:
            nextStatus === BlogPostStatus.DRAFT
              ? null
              : shouldPublish
                ? new Date()
                : existing.publishedAt,
        },
        select: BLOG_SELECT,
        where: { id },
      });
    } catch (error) {
      if (isUniqueConflict(error)) throw new ConflictException('Slug exists');
      throw error;
    }
  }

  async deleteAdmin(id: string) {
    try {
      await this.prisma.blogPost.delete({ where: { id } });
    } catch (error) {
      if (isNotFoundConflict(error)) {
        throw new NotFoundException('Blog post not found');
      }
      throw error;
    }
    return { deleted: true };
  }
}

function normalizeSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 255);
  if (!slug) throw new BadRequestException('Slug is required');
  return slug;
}

function isUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function isNotFoundConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}
