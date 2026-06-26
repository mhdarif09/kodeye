import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type {
  CreatePortfolioProjectDto,
  UpdatePortfolioProjectDto,
} from './dto/portfolio.dto';

const PORTFOLIO_SELECT = {
  id: true,
  title: true,
  subtitle: true,
  category: true,
  imageUrl: true,
  projectUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PortfolioProjectSelect;

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished() {
    return this.prisma.portfolioProject.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: PORTFOLIO_SELECT,
      where: { isActive: true },
    });
  }

  listAdmin() {
    return this.prisma.portfolioProject.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: PORTFOLIO_SELECT,
    });
  }

  async createAdmin(dto: CreatePortfolioProjectDto) {
    return this.prisma.portfolioProject.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        category: dto.category,
        imageUrl: dto.imageUrl,
        projectUrl: dto.projectUrl ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      select: PORTFOLIO_SELECT,
    });
  }

  async updateAdmin(id: string, dto: UpdatePortfolioProjectDto) {
    const existing = await this.prisma.portfolioProject.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Portfolio project not found');

    return this.prisma.portfolioProject.update({
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.projectUrl !== undefined && { projectUrl: dto.projectUrl ?? null }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: PORTFOLIO_SELECT,
      where: { id },
    });
  }

  async deleteAdmin(id: string) {
    const existing = await this.prisma.portfolioProject.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Portfolio project not found');

    await this.prisma.portfolioProject.delete({ where: { id } });
    return { id, success: true };
  }
}
