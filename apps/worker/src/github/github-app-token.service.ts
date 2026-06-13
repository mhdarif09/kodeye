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
    if (pathValue && existsSync(pathValue)) {
      const key = readFileSync(pathValue, 'utf8');
      if (key.includes('BEGIN')) return key;
    }

    const configured = this.environment.githubAppPrivateKey;
    if (!configured)
      throw new Error('GitHub App private key is not configured');
    if (configured.includes('BEGIN')) return configured.replace(/\\n/g, '\n');
    if (existsSync(configured)) {
      const key = readFileSync(configured, 'utf8');
      if (key.includes('BEGIN')) return key;
    }
    const decoded = Buffer.from(configured, 'base64').toString('utf8');
    if (!decoded.includes('BEGIN')) {
      throw new Error('GitHub App private key configuration is invalid');
    }
    return decoded;
  }
}
