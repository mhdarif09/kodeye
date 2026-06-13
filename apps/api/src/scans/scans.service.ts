import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RepositoryProvider,
  ScanStatus,
  ScanTriggerType,
} from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { RepositoriesService } from '../repositories/repositories.service';
import type { CreateScanDto } from './dto/create-scan.dto';
import type { ListFindingsQueryDto } from './dto/list-findings-query.dto';
import type { ListScansQueryDto } from './dto/list-scans-query.dto';
import { BillingService } from '../billing/services/billing.service';

const repositorySelect = {
  defaultBranch: true,
  fullName: true,
  id: true,
  name: true,
  provider: true,
} as const;

const findingSelect = {
  category: true,
  confidence: true,
  createdAt: true,
  cwe: true,
  description: true,
  evidenceMasked: true,
  filePath: true,
  id: true,
  impact: true,
  lineEnd: true,
  lineStart: true,
  owasp: true,
  recommendation: true,
  scanner: true,
  severity: true,
  status: true,
  title: true,
  updatedAt: true,
} as const;

@Injectable()
export class ScansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repositoriesService: RepositoriesService,
    private readonly billing: BillingService,
  ) {}

  async create(userId: string, repositoryId: string, dto: CreateScanDto) {
    const repository = await this.repositoriesService.findAccessibleById(
      userId,
      repositoryId,
    );
    if (repository.provider !== RepositoryProvider.GITHUB) {
      throw new BadRequestException(
        'Manual repository scanning is not supported yet. Please connect a GitHub repository.',
      );
    }
    if (!repository.isConnected || repository.isArchived) {
      throw new BadRequestException(
        'This GitHub repository is disconnected or archived and cannot be scanned.',
      );
    }
    await this.billing.assertLimits(repository.organizationId, 'scan');

    return this.prisma.scanJob.create({
      data: {
        branch: dto.branch?.trim() || repository.defaultBranch,
        organizationId: repository.organizationId,
        repositoryId: repository.id,
        status: ScanStatus.PENDING,
        triggeredByUserId: userId,
        triggerType: ScanTriggerType.MANUAL,
      },
      include: { repository: { select: repositorySelect } },
    });
  }

  findAll(userId: string, query: ListScansQueryDto) {
    return this.prisma.scanJob.findMany({
      include: { repository: { select: repositorySelect } },
      orderBy: { createdAt: 'desc' },
      where: {
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
        ...(query.organizationId
          ? { organizationId: query.organizationId }
          : {}),
        ...(query.repositoryId ? { repositoryId: query.repositoryId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
    });
  }

  async findOne(userId: string, scanId: string) {
    const scan = await this.prisma.scanJob.findFirst({
      include: {
        organization: { select: { id: true, name: true } },
        repository: { select: repositorySelect },
      },
      where: {
        id: scanId,
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
    if (!scan) throw new NotFoundException('Scan job not found');
    return scan;
  }

  async findFindings(
    userId: string,
    scanId: string,
    query: ListFindingsQueryDto,
  ) {
    await this.assertAccessible(userId, scanId);
    return this.prisma.finding.findMany({
      orderBy: { createdAt: 'asc' },
      select: findingSelect,
      where: {
        scanJobId: scanId,
        ...(query.severity ? { severity: query.severity } : {}),
        ...(query.scanner ? { scanner: query.scanner } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
    });
  }

  async findLogs(userId: string, scanId: string) {
    await this.assertAccessible(userId, scanId);
    return this.prisma.scanLog.findMany({
      orderBy: { createdAt: 'asc' },
      where: { scanJobId: scanId },
    });
  }

  private async assertAccessible(userId: string, scanId: string) {
    const scan = await this.prisma.scanJob.findFirst({
      select: { id: true },
      where: {
        id: scanId,
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
    if (!scan) throw new NotFoundException('Scan job not found');
  }
}
