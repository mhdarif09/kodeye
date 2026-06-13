import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, RepositoryProvider } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import type { GitHubInstallCallbackDto } from './dto/github-install-callback.dto';
import type { GitHubRepositoriesQueryDto } from './dto/github-repositories-query.dto';
import type { SyncGitHubRepositoriesDto } from './dto/sync-github-repositories.dto';
import { GitHubAppService } from './github-app.service';
import { BillingService } from '../billing/services/billing.service';

@Injectable()
export class GitHubService {
  constructor(
    private readonly githubAppService: GitHubAppService,
    private readonly organizationsService: OrganizationsService,
    private readonly prisma: PrismaService,
    private readonly billing: BillingService,
  ) {}

  async prepareInstallation(userId: string, organizationId: string) {
    const organization = await this.organizationsService.findOwnedById(
      userId,
      organizationId,
    );
    const state = this.githubAppService.createInstallationState({
      organizationId: organization.id,
      userId,
    });
    return { installUrl: this.githubAppService.getInstallationUrl(state) };
  }

  async completeInstallation(query: GitHubInstallCallbackDto) {
    if (!query.state) {
      throw new UnauthorizedException('Missing GitHub setup state');
    }
    const state = this.githubAppService.verifyInstallationState(query.state);
    await this.organizationsService.findOwnedById(
      state.userId,
      state.organizationId,
    );
    let details;
    try {
      details = await this.githubAppService.getInstallation(
        query.installation_id,
      );
    } catch {
      details = {
        account: {
          login: `installation-${query.installation_id}`,
          type: 'Unknown',
        },
        id: Number(query.installation_id),
        permissions: {},
        repository_selection: 'selected',
        target_type: null,
      };
    }
    const installationId = query.installation_id;
    const existingInstallation =
      await this.prisma.gitHubInstallation.findUnique({
        where: { installationId },
      });
    if (
      existingInstallation &&
      existingInstallation.organizationId !== state.organizationId
    ) {
      throw new ConflictException(
        'GitHub installation is already connected to another organization',
      );
    }
    return this.prisma.gitHubInstallation.upsert({
      create: {
        githubAccountLogin: details.account.login,
        githubAccountType: details.account.type,
        installationId,
        organizationId: state.organizationId,
        permissionsJson: details.permissions as Prisma.InputJsonValue,
        repositorySelection: details.repository_selection,
        targetType: details.target_type,
      },
      update: {
        githubAccountLogin: details.account.login,
        githubAccountType: details.account.type,
        organizationId: state.organizationId,
        permissionsJson: details.permissions as Prisma.InputJsonValue,
        repositorySelection: details.repository_selection,
        targetType: details.target_type,
      },
      where: { installationId },
    });
  }

  findInstallations(userId: string) {
    return this.prisma.gitHubInstallation.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
  }

  findRepositories(userId: string, query: GitHubRepositoriesQueryDto) {
    return this.prisma.repository.findMany({
      orderBy: { updatedAt: 'desc' },
      where: {
        provider: RepositoryProvider.GITHUB,
        ...(query.organizationId
          ? {
              organizationId: query.organizationId,
              organization: {
                OR: [
                  { ownerUserId: userId },
                  { members: { some: { userId } } },
                ],
              },
            }
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

  async syncRepositories(userId: string, dto: SyncGitHubRepositoriesDto) {
    await this.organizationsService.findOwnedById(userId, dto.organizationId);
    const installation = await this.prisma.gitHubInstallation.findFirst({
      where: {
        installationId: dto.installationId,
        organizationId: dto.organizationId,
      },
    });
    if (!installation) {
      throw new NotFoundException('GitHub installation not found');
    }

    const githubRepositories =
      await this.githubAppService.getInstallationRepositories(
        dto.installationId,
      );
    const syncedRepositories = [];

    for (const githubRepository of githubRepositories) {
      const existingRepository = await this.prisma.repository.findFirst({
        where: {
          organizationId: dto.organizationId,
          OR: [
            { githubRepoId: githubRepository.id.toString() },
            { name: githubRepository.name },
          ],
        },
      });
      const data = {
        defaultBranch: githubRepository.default_branch,
        fullName: githubRepository.full_name,
        githubRepoId: githubRepository.id.toString(),
        htmlUrl: githubRepository.html_url,
        isArchived: false,
        isConnected: true,
        isPrivate: githubRepository.private,
        name: githubRepository.name,
        organizationId: dto.organizationId,
        provider: RepositoryProvider.GITHUB,
        repoUrl: githubRepository.clone_url || githubRepository.html_url,
      };
      syncedRepositories.push(
        existingRepository
          ? await this.prisma.repository.update({
              data,
              where: { id: existingRepository.id },
            })
          : await (async () => {
              await this.billing.assertLimits(dto.organizationId, 'repository');
              return this.prisma.repository.create({ data });
            })(),
      );
    }

    return syncedRepositories;
  }
}
