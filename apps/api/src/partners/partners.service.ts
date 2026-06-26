import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type {
  CreateTrustedCompanyDto,
  UpdateTrustedCompanyDto,
} from './dto/partners.dto';

const PARTNERS_SELECT = {
  id: true,
  name: true,
  logoUrl: true,
  websiteUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TrustedCompanySelect;

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished() {
    return this.prisma.trustedCompany.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: PARTNERS_SELECT,
      where: { isActive: true },
    });
  }

  listAdmin() {
    return this.prisma.trustedCompany.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: PARTNERS_SELECT,
    });
  }

  async createAdmin(dto: CreateTrustedCompanyDto) {
    return this.prisma.trustedCompany.create({
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      select: PARTNERS_SELECT,
    });
  }

  async updateAdmin(id: string, dto: UpdateTrustedCompanyDto) {
    const existing = await this.prisma.trustedCompany.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Trusted company not found');

    return this.prisma.trustedCompany.update({
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl ?? null }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: PARTNERS_SELECT,
      where: { id },
    });
  }

  async deleteAdmin(id: string) {
    const existing = await this.prisma.trustedCompany.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Trusted company not found');

    await this.prisma.trustedCompany.delete({ where: { id } });
    return { id, success: true };
  }
}
