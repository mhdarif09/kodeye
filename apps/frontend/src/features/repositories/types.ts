export interface Repository {
  id: string;
  organizationId: string;
  provider: 'MANUAL' | 'GITHUB';
  name: string;
  fullName: string | null;
  repoUrl: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  githubRepoId: string | null;
  htmlUrl: string | null;
  autoScanPushEnabled: boolean;
  autoScanPullRequestEnabled: boolean;
  isArchived: boolean;
  isConnected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAutomationSettingsInput {
  autoScanPushEnabled: boolean;
  autoScanPullRequestEnabled: boolean;
}

export interface CreateRepositoryInput {
  organizationId: string;
  name: string;
  repoUrl?: string;
  defaultBranch?: string;
  isPrivate?: boolean;
}
