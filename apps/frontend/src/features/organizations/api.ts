import { apiClient } from '../../lib/api-client';
import type { Organization } from './types';

export const organizationsApi = {
  create: (name: string) =>
    apiClient<Organization>('/organizations', {
      authenticated: true,
      body: { name },
      method: 'POST',
    }),
  list: () =>
    apiClient<Organization[]>('/organizations', { authenticated: true }),
};
