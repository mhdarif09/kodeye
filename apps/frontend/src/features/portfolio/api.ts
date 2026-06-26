import { apiClient } from '../../lib/api-client';
import type { PortfolioProject, PortfolioProjectInput } from './types';

export const portfolioApi = {
  adminCreate: (input: PortfolioProjectInput) =>
    apiClient<PortfolioProject>('/admin/portfolio/projects', {
      authenticated: true,
      body: input,
      method: 'POST',
    }),
  adminDelete: (id: string) =>
    apiClient<{ id: string; success: boolean }>(
      `/admin/portfolio/projects/${id}`,
      {
        authenticated: true,
        method: 'DELETE',
      },
    ),
  adminList: () =>
    apiClient<PortfolioProject[]>('/admin/portfolio/projects', {
      authenticated: true,
    }),
  adminUpdate: (id: string, input: Partial<PortfolioProjectInput>) =>
    apiClient<PortfolioProject>(`/admin/portfolio/projects/${id}`, {
      authenticated: true,
      body: input,
      method: 'PATCH',
    }),
  listPublished: () => apiClient<PortfolioProject[]>('/portfolio/projects'),
};
