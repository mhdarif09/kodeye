import { apiClient } from '../../lib/api-client';
import type {
  CreateRepositoryInput,
  Repository,
  UpdateAutomationSettingsInput,
} from './types';

export const repositoriesApi = {
  create: (input: CreateRepositoryInput) =>
    apiClient<Repository>('/repositories', {
      authenticated: true,
      body: input,
      method: 'POST',
    }),
  list: () => apiClient<Repository[]>('/repositories', { authenticated: true }),
  updateAutomationSettings: (
    repositoryId: string,
    input: UpdateAutomationSettingsInput,
  ) =>
    apiClient<Repository>(`/repositories/${repositoryId}/automation-settings`, {
      authenticated: true,
      body: input,
      method: 'PATCH',
    }),
};
