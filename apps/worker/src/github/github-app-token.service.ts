import { existsSync, readFileSync } from 'node:fs';
import jwt from 'jsonwebtoken';

import type { WorkerEnvironment } from '../config/env';

export class GitHubAppTokenService {
  constructor(private readonly environment: WorkerEnvironment) {}

  createToken(): string {
    const now = Math.floor(Date.now() / 1000);
    if (!this.environment.githubAppId) {
      throw new Error('GITHUB_APP_ID is not configured');
    }
    return jwt.sign(
      {
        exp: now + 9 * 60,
        iat: now - 60,
        iss: this.environment.githubAppId,
      },
      this.getPrivateKey(),
      { algorithm: 'RS256' },
    );
  }

  private getPrivateKey(): string {
    const pathValue = this.environment.githubAppPrivateKeyPath;
    if (!pathValue)
      throw new Error('GITHUB_APP_PRIVATE_KEY_PATH is not configured');
    if (!existsSync(pathValue))
      throw new Error('GitHub App private key file does not exist');
    const key = readFileSync(pathValue, 'utf8');
    if (!key.includes('BEGIN'))
      throw new Error('GitHub App private key file is invalid');
    return key;
  }
}
