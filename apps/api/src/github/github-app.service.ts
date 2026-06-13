import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { existsSync, readFileSync } from 'node:fs';

import type {
  GitHubInstallationDetails,
  GitHubInstallationState,
} from './types/github-installation.type';
import type { GitHubRepository } from './types/github-repository.type';
import { AppSettingsService } from '../settings/app-settings.service';

@Injectable()
export class GitHubAppService {
  constructor(private readonly configService: AppSettingsService) {}

  createInstallationState(state: GitHubInstallationState): string {
    return jwt.sign(state, this.getRequiredConfig('JWT_SECRET'), {
      expiresIn: '10m',
      subject: state.userId,
    });
  }

  verifyInstallationState(state: string): GitHubInstallationState {
    try {
      const payload = jwt.verify(
        state,
        this.getRequiredConfig('JWT_SECRET'),
      ) as GitHubInstallationState;
      if (!payload.userId || !payload.organizationId) throw new Error();
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired GitHub setup state');
    }
  }

  getInstallationUrl(state: string): string {
    const url = new URL(this.getRequiredConfig('GITHUB_APP_INSTALL_URL'));
    url.searchParams.set('state', state);
    return url.toString();
  }

  async getInstallation(
    installationId: string,
  ): Promise<GitHubInstallationDetails> {
    return this.appRequest<GitHubInstallationDetails>(
      `/app/installations/${installationId}`,
    );
  }

  async getInstallationRepositories(
    installationId: string,
  ): Promise<GitHubRepository[]> {
    const tokenResponse = await this.appRequest<{ token: string }>(
      `/app/installations/${installationId}/access_tokens`,
      { method: 'POST' },
    );
    const repositoriesResponse = await this.githubRequest<{
      repositories: GitHubRepository[];
    }>('/installation/repositories?per_page=100', tokenResponse.token);
    return repositoriesResponse.repositories;
  }

  async createInstallationToken(installationId: string): Promise<string> {
    const response = await this.appRequest<{ token: string }>(
      `/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
      { method: 'POST' },
    );
    return response.token;
  }

  async installationRequest<T>(
    installationId: string,
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.createInstallationToken(installationId);
    return this.githubRequest<T>(path, token, options);
  }

  private async appRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    return this.githubRequest<T>(path, this.createAppJwt(), options);
  }

  private async githubRequest<T>(
    path: string,
    token: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`https://api.github.com${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Kodeye',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
      },
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        'GitHub App request failed. Check the installation and server configuration.',
      );
    }
    return (await response.json()) as T;
  }

  private createAppJwt(): string {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
      {
        exp: now + 9 * 60,
        iat: now - 60,
        iss: this.getRequiredConfig('GITHUB_APP_ID'),
      },
      this.getPrivateKey(),
      { algorithm: 'RS256' },
    );
  }

  private getPrivateKey(): string {
    const configuredPath = this.getRequiredConfig(
      'GITHUB_APP_PRIVATE_KEY_PATH',
    );
    if (!existsSync(configuredPath)) {
      throw new ServiceUnavailableException(
        'GitHub App private key file does not exist',
      );
    }
    const fileKey = readFileSync(configuredPath, 'utf8');
    if (!fileKey.includes('BEGIN')) {
      throw new ServiceUnavailableException(
        'GitHub App private key file is invalid',
      );
    }
    return fileKey;
  }

  private getRequiredConfig(name: string): string {
    const value = this.configService.get<string>(name);
    if (!value) {
      throw new ServiceUnavailableException(
        'GitHub App is not configured on this server',
      );
    }
    return value;
  }
}
