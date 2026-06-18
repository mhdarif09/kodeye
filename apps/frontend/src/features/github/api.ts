import { apiClient } from '../../lib/api-client';
import type {
  GitHubInstallation,
  GitHubInstallResult,
  GitHubRepository,
} from './types';

export const githubApi = {
  getInstallUrl: (
    organizationId: string,
    returnTo: 'github-integration' | 'onboarding' = 'github-integration',
  ) =>
    apiClient<GitHubInstallResult>(
      `/github/install?organizationId=${encodeURIComponent(organizationId)}&returnTo=${encodeURIComponent(returnTo)}`,
      { authenticated: true },
    ),
  installations: () =>
    apiClient<GitHubInstallation[]>('/github/installations', {
      authenticated: true,
    }),
  repositories: (organizationId?: string) =>
    apiClient<GitHubRepository[]>(
      `/github/repositories${organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : ''}`,
      { authenticated: true },
    ),
  syncRepositories: (organizationId: string, installationId: string) =>
    apiClient<GitHubRepository[]>('/github/repositories/sync', {
      authenticated: true,
      body: { installationId, organizationId },
      method: 'POST',
    }),
};
