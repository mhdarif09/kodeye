import type { WorkerEnvironment } from '../config/env';
import { GitHubInstallationTokenService } from './github-installation-token.service';

export class GitHubChecksService {
  constructor(
    private readonly installationToken: GitHubInstallationTokenService,
    private readonly environment: WorkerEnvironment,
  ) {}

  async update(
    installationId: string,
    fullName: string,
    checkRunId: string,
    scanId: string,
    input: {
      conclusion?: 'failure' | 'success';
      status: 'completed' | 'in_progress';
      summary: string;
    },
  ) {
    const token = await this.installationToken.createToken(installationId);
    const response = await fetch(
      `https://api.github.com/repos/${fullName}/check-runs/${encodeURIComponent(checkRunId)}`,
      {
        body: JSON.stringify({
          conclusion: input.conclusion,
          details_url: `${this.environment.githubCheckDetailsBaseUrl.replace(/\/$/, '')}/${scanId}`,
          name: this.environment.githubCheckName,
          output: {
            summary: input.summary,
            title: this.environment.githubCheckName,
          },
          status: input.status,
        }),
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Kodeye Worker',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        method: 'PATCH',
      },
    );
    if (!response.ok)
      throw new Error(`GitHub Check Run update failed (${response.status})`);
  }
}
