import { GitHubAppTokenService } from './github-app-token.service';

export class GitHubInstallationTokenService {
  constructor(private readonly appTokenService: GitHubAppTokenService) {}

  async createToken(installationId: string): Promise<string> {
    const response = await fetch(
      `https://api.github.com/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${this.appTokenService.createToken()}`,
          'User-Agent': 'Kodeye Worker',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        method: 'POST',
      },
    );
    if (!response.ok) {
      throw new Error(
        `GitHub installation token request failed (${response.status})`,
      );
    }
    const payload = (await response.json()) as { token?: string };
    if (!payload.token)
      throw new Error('GitHub did not return an installation token');
    return payload.token;
  }
}
