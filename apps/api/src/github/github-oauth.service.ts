import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrganizationRole, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import type { GitHubUser } from './types/github-user.type';
import { AppSettingsService } from '../settings/app-settings.service';

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

@Injectable()
export class GitHubOAuthService {
  constructor(
    private readonly configService: AppSettingsService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  getAuthorizationUrl(state: string): string {
    const clientId = this.getRequiredConfig('GITHUB_OAUTH_CLIENT_ID');
    const callbackUrl = this.getRequiredConfig('GITHUB_OAUTH_CALLBACK_URL');
    const parameters = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'read:user user:email',
      state,
    });
    return `https://github.com/login/oauth/authorize?${parameters.toString()}`;
  }

  async authenticate(code: string) {
    const oauthToken = await this.exchangeCode(code);
    const githubUser = await this.githubRequest<GitHubUser>(
      '/user',
      oauthToken,
    );
    const emails = await this.githubRequest<GitHubEmail[]>(
      '/user/emails',
      oauthToken,
    );
    const email =
      emails.find((item) => item.primary && item.verified)?.email ??
      emails.find((item) => item.verified)?.email ??
      githubUser.email;

    if (!email) {
      throw new UnauthorizedException(
        'GitHub account must provide a verified email address',
      );
    }

    const normalizedEmail = email.toLowerCase();
    const generatedPasswordHash = await bcrypt.hash(
      randomBytes(48).toString('hex'),
      12,
    );
    const user = await this.prisma.$transaction(async (transaction) => {
      const linkedAccount = await transaction.gitHubAccount.findUnique({
        include: { user: { select: publicUserSelect } },
        where: { githubUserId: githubUser.id.toString() },
      });

      if (linkedAccount) {
        await transaction.gitHubAccount.update({
          data: this.githubAccountData(githubUser, normalizedEmail),
          where: { id: linkedAccount.id },
        });
        return linkedAccount.user;
      }

      const existingUser = await transaction.user.findUnique({
        select: publicUserSelect,
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        const existingLink = await transaction.gitHubAccount.findUnique({
          where: { userId: existingUser.id },
        });
        if (existingLink) {
          throw new ConflictException(
            'This Kodeye account is already linked to another GitHub account',
          );
        }
        await transaction.gitHubAccount.create({
          data: {
            ...this.githubAccountData(githubUser, normalizedEmail),
            userId: existingUser.id,
          },
        });
        return existingUser;
      }

      const createdUser = await transaction.user.create({
        data: {
          email: normalizedEmail,
          name: githubUser.name?.trim() || githubUser.login,
          passwordHash: generatedPasswordHash,
          role: UserRole.USER,
        },
        select: publicUserSelect,
      });
      await transaction.gitHubAccount.create({
        data: {
          ...this.githubAccountData(githubUser, normalizedEmail),
          userId: createdUser.id,
        },
      });
      await transaction.organization.create({
        data: {
          members: {
            create: {
              role: OrganizationRole.OWNER,
              userId: createdUser.id,
            },
          },
          name: `${createdUser.name}'s Organization`,
          ownerUserId: createdUser.id,
        },
      });
      return createdUser;
    });

    const accessToken = await this.jwtService.signAsync({
      email: user.email,
      role: user.role,
      sub: user.id,
    });
    const [githubInstallationCount, ownedOrganization] = await Promise.all([
      this.prisma.gitHubInstallation.count({
        where: {
          organization: {
            OR: [
              { ownerUserId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
      }),
      this.prisma.organization.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true },
        where: { ownerUserId: user.id },
      }),
    ]);

    return {
      accessToken,
      githubInstallOrganizationId:
        githubInstallationCount === 0 ? ownedOrganization?.id : undefined,
      user,
    };
  }

  private githubAccountData(githubUser: GitHubUser, email: string) {
    return {
      avatarUrl: githubUser.avatar_url,
      email,
      githubUserId: githubUser.id.toString(),
      profileUrl: githubUser.html_url,
      username: githubUser.login,
    };
  }

  private async exchangeCode(code: string): Promise<string> {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        body: JSON.stringify({
          client_id: this.getRequiredConfig('GITHUB_OAUTH_CLIENT_ID'),
          client_secret: this.getRequiredConfig('GITHUB_OAUTH_CLIENT_SECRET'),
          code,
          redirect_uri: this.getRequiredConfig('GITHUB_OAUTH_CALLBACK_URL'),
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    );
    const payload = (await response.json()) as {
      access_token?: string;
      error_description?: string;
    };
    if (!response.ok || !payload.access_token) {
      throw new UnauthorizedException(
        payload.error_description ?? 'GitHub authentication failed',
      );
    }
    return payload.access_token;
  }

  private async githubRequest<T>(path: string, token: string): Promise<T> {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Kodeye',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!response.ok) {
      throw new UnauthorizedException('Unable to read GitHub profile');
    }
    return (await response.json()) as T;
  }

  private getRequiredConfig(name: string): string {
    const value = this.configService.get<string>(name);
    if (!value) {
      throw new ServiceUnavailableException(
        'GitHub OAuth is not configured on this server',
      );
    }
    return value;
  }
}
