import { apiClient } from '../../lib/api-client';
import type { TrustedCompany, TrustedCompanyInput } from './types';

export const partnersApi = {
  adminCreate: (input: TrustedCompanyInput) =>
    apiClient<TrustedCompany>('/admin/partners/companies', {
      authenticated: true,
      body: input,
      method: 'POST',
    }),
  adminDelete: (id: string) =>
    apiClient<{ id: string; success: boolean }>(
      `/admin/partners/companies/${id}`,
      {
        authenticated: true,
        method: 'DELETE',
      },
    ),
  adminList: () =>
    apiClient<TrustedCompany[]>('/admin/partners/companies', {
      authenticated: true,
    }),
  adminUpdate: (id: string, input: Partial<TrustedCompanyInput>) =>
    apiClient<TrustedCompany>(`/admin/partners/companies/${id}`, {
      authenticated: true,
      body: input,
      method: 'PATCH',
    }),
  listPublished: () => apiClient<TrustedCompany[]>('/partners/companies'),
};
