import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type {
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
} from './dto/team.dto';

const TEAM_SELECT = {
  id: true,
  name: true,
  role: true,
  description: true,
  photoUrl: true,
  linkedinUrl: true,
  githubUrl: true,
  instagramUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TeamMemberSelect;

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished() {
    return this.prisma.teamMember.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: TEAM_SELECT,
      where: { isActive: true },
    });
  }

  listAdmin() {
    return this.prisma.teamMember.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: TEAM_SELECT,
    });
  }

  async createAdmin(dto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({
      data: {
        name: dto.name,
        role: dto.role,
        description: dto.description,
        photoUrl: dto.photoUrl,
        linkedinUrl: dto.linkedinUrl ?? null,
        githubUrl: dto.githubUrl ?? null,
        instagramUrl: dto.instagramUrl ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      select: TEAM_SELECT,
    });
  }

  async updateAdmin(id: string, dto: UpdateTeamMemberDto) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Team member not found');

    return this.prisma.teamMember.update({
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.linkedinUrl !== undefined && { linkedinUrl: dto.linkedinUrl ?? null }),
        ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl ?? null }),
        ...(dto.instagramUrl !== undefined && { instagramUrl: dto.instagramUrl ?? null }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: TEAM_SELECT,
      where: { id },
    });
  }

  async deleteAdmin(id: string) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Team member not found');

    await this.prisma.teamMember.delete({ where: { id } });
    return { id, success: true };
  }
}
