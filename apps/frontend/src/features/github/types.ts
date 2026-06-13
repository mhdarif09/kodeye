import type { Repository } from '../repositories/types';

export interface GitHubInstallation {
  id: string;
  organizationId: string;
  installationId: string;
  githubAccountLogin: string;
  githubAccountType: string;
  targetType: string | null;
  permissionsJson: Record<string, string> | null;
  repositorySelection: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubInstallResult {
  installUrl: string;
}

export type GitHubRepository = Repository;
