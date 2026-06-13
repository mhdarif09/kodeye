import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRole } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
      },
    });
  }

  create(userId: string, dto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        members: {
          create: {
            role: OrganizationRole.OWNER,
            userId,
          },
        },
        name: dto.name.trim(),
        ownerUserId: userId,
      },
    });
  }

  async findAccessibleById(userId: string, organizationId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findOwnedById(userId: string, organizationId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { id: organizationId, ownerUserId: userId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }
}
