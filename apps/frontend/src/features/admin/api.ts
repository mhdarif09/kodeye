import { apiClient } from '../../lib/api-client';
import type {
  AdminAuditLog,
  AdminDashboardSummary,
  AdminSetting,
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
  ProviderTestResult,
  SettingCategory,
} from './types';

export const adminApi = {
  auditLogs: () =>
    apiClient<AdminAuditLog[]>('/admin/audit-logs', { authenticated: true }),
  clearSecret: (key: string) =>
    apiClient<AdminSetting>(
      `/admin/settings/${encodeURIComponent(key)}/clear-secret`,
      {
        authenticated: true,
        method: 'POST',
      },
    ),
  dashboard: () =>
    apiClient<AdminDashboardSummary>('/admin/dashboard', {
      authenticated: true,
    }),
  deleteUser: (id: string) =>
    apiClient<AdminUser>(`/admin/users/${id}`, {
      authenticated: true,
      method: 'DELETE',
    }),
  reactivateUser: (id: string) =>
    apiClient<AdminUser>(`/admin/users/${id}/reactivate`, {
      authenticated: true,
      method: 'PATCH',
    }),
  reloadSettings: () =>
    apiClient<{ ok: boolean }>('/admin/settings/reload', {
      authenticated: true,
      method: 'POST',
    }),
  settings: (category?: SettingCategory) =>
    apiClient<AdminSetting[]>(
      `/admin/settings${category ? `?category=${category}` : ''}`,
      { authenticated: true },
    ),
  testProvider: (provider: 'github' | 'midtrans' | 'paypal' | 'currency') =>
    apiClient<ProviderTestResult>('/admin/providers/test', {
      authenticated: true,
      body: { provider },
      method: 'POST',
    }),
  suspendUser: (id: string) =>
    apiClient<AdminUser>(`/admin/users/${id}/suspend`, {
      authenticated: true,
      method: 'PATCH',
    }),
  updateUserRole: (id: string, role: AdminUserRole) =>
    apiClient<AdminUser>(`/admin/users/${id}/role`, {
      authenticated: true,
      body: { role },
      method: 'PATCH',
    }),
  updateSettings: (settings: Record<string, string | null>) =>
    apiClient<AdminSetting[]>('/admin/settings', {
      authenticated: true,
      body: { settings },
      method: 'PATCH',
    }),
  users: (query?: {
    role?: AdminUserRole | '';
    search?: string;
    status?: AdminUserStatus | '';
  }) => {
    const params = new URLSearchParams();
    if (query?.search) params.set('search', query.search);
    if (query?.role) params.set('role', query.role);
    if (query?.status) params.set('status', query.status);
    return apiClient<AdminUser[]>(
      `/admin/users${params.size ? `?${params}` : ''}`,
      { authenticated: true },
    );
  },
};
