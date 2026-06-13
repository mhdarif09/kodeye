import { Injectable } from '@nestjs/common';

import { GitHubAppService } from '../github-app.service';
import type {
  GitHubCheckConclusion,
  GitHubCheckRunResponse,
} from './github-checks.types';
import { AppSettingsService } from '../../settings/app-settings.service';

@Injectable()
export class GitHubChecksService {
  constructor(
    private readonly config: AppSettingsService,
    private readonly githubApp: GitHubAppService,
  ) {}

  async create(
    installationId: string,
    repositoryFullName: string,
    headSha: string,
    scanId: string,
  ): Promise<GitHubCheckRunResponse> {
    return this.request(installationId, repositoryFullName, '', {
      details_url: this.detailsUrl(scanId),
      head_sha: headSha,
      name: this.name,
      output: {
        summary: 'Security scan has been queued.',
        title: this.name,
      },
      status: 'queued',
    });
  }

  async update(
    installationId: string,
    repositoryFullName: string,
    checkRunId: string,
    scanId: string,
    input: {
      conclusion?: GitHubCheckConclusion;
      status: 'completed' | 'in_progress';
      summary: string;
    },
  ): Promise<GitHubCheckRunResponse> {
    return this.request(
      installationId,
      repositoryFullName,
      `/${encodeURIComponent(checkRunId)}`,
      {
        conclusion: input.conclusion,
        details_url: this.detailsUrl(scanId),
        name: this.name,
        output: { summary: input.summary, title: this.name },
        status: input.status,
      },
    );
  }

  private request(
    installationId: string,
    repositoryFullName: string,
    suffix: string,
    body: object,
  ) {
    return this.githubApp.installationRequest<GitHubCheckRunResponse>(
      installationId,
      `/repos/${repositoryFullName}/check-runs${suffix}`,
      {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: suffix ? 'PATCH' : 'POST',
      },
    );
  }

  private get name(): string {
    return (
      this.config.get<string>('GITHUB_CHECK_NAME') ?? 'Kodeye Security Scan'
    );
  }

  private detailsUrl(scanId: string): string {
    const base =
      this.config.get<string>('GITHUB_CHECK_DETAILS_BASE_URL') ??
      'http://localhost:3000/dashboard/scans';
    return `${base.replace(/\/$/, '')}/${scanId}`;
  }
}
