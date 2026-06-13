import { apiClient } from '../../lib/api-client';
import type {
  AdminAuditLog,
  AdminDashboardSummary,
  AdminSetting,
  ProviderTestResult,
  SettingCategory,
} from './types';

export const adminApi = {
  auditLogs: () =>
    apiClient<AdminAuditLog[]>('/admin/audit-logs', { authenticated: true }),
  clearSecret: (key: string) =>
    apiClient<AdminSetting>(`/admin/settings/${encodeURIComponent(key)}/clear-secret`, {
      authenticated: true,
      method: 'POST',
    }),
  dashboard: () =>
    apiClient<AdminDashboardSummary>('/admin/dashboard', {
      authenticated: true,
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
  updateSettings: (settings: Record<string, string | null>) =>
    apiClient<AdminSetting[]>('/admin/settings', {
      authenticated: true,
      body: { settings },
      method: 'PATCH',
    }),
};
