import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RepositoryProvider } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import type { CreateRepositoryDto } from './dto/create-repository.dto';
import type { ListRepositoriesQueryDto } from './dto/list-repositories-query.dto';
import type { UpdateAutomationSettingsDto } from './dto/update-automation-settings.dto';
import { BillingService } from '../billing/services/billing.service';

@Injectable()
export class RepositoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
    private readonly billing: BillingService,
  ) {}

  async findAllForUser(userId: string, query: ListRepositoriesQueryDto) {
    if (query.organizationId) {
      await this.organizationsService.findAccessibleById(
        userId,
        query.organizationId,
      );
    }

    return this.prisma.repository.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        ...(query.organizationId
          ? { organizationId: query.organizationId }
          : {
              organization: {
                OR: [
                  { ownerUserId: userId },
                  { members: { some: { userId } } },
                ],
              },
            }),
      },
    });
  }

  async create(userId: string, dto: CreateRepositoryDto) {
    await this.organizationsService.findOwnedById(userId, dto.organizationId);
    await this.billing.assertLimits(dto.organizationId, 'repository');

    try {
      return await this.prisma.repository.create({
        data: {
          defaultBranch: dto.defaultBranch ?? 'main',
          htmlUrl: dto.repoUrl,
          isPrivate: dto.isPrivate ?? false,
          name: dto.name.trim(),
          organizationId: dto.organizationId,
          provider: RepositoryProvider.MANUAL,
          repoUrl: dto.repoUrl,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Repository name already exists in this organization',
        );
      }
      throw error;
    }
  }

  async findAccessibleById(userId: string, repositoryId: string) {
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repositoryId,
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    return repository;
  }

  async updateAutomationSettings(
    userId: string,
    repositoryId: string,
    dto: UpdateAutomationSettingsDto,
  ) {
    const repository = await this.prisma.repository.findFirst({
      where: { id: repositoryId, organization: { ownerUserId: userId } },
    });
    if (!repository) throw new NotFoundException('Repository not found');
    if (repository.provider !== RepositoryProvider.GITHUB) {
      throw new ConflictException(
        'Automatic scanning is only supported for GitHub repositories',
      );
    }
    return this.prisma.repository.update({
      data: dto,
      where: { id: repository.id },
    });
  }
}
