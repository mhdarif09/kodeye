import { apiClient } from '../../lib/api-client';
import type {
  Currency,
  CurrencyCode,
  Invoice,
  Payment,
  Plan,
  Subscription,
  AdminPlan,
  AdminSetting,
} from './types';
export const billingApi = {
  currencies: () => apiClient<Currency[]>('/currencies'),
  plans: (currency: CurrencyCode) =>
    apiClient<Plan[]>(`/plans?currency=${currency}`),
  current: (organizationId: string) =>
    apiClient<Subscription>(
      `/subscriptions/current?organizationId=${organizationId}`,
      { authenticated: true },
    ),
  payments: (organizationId: string) =>
    apiClient<Payment[]>(`/payments?organizationId=${organizationId}`, {
      authenticated: true,
    }),
  invoices: (organizationId: string) =>
    apiClient<Invoice[]>(`/invoices?organizationId=${organizationId}`, {
      authenticated: true,
    }),
  invoice: (id: string) =>
    apiClient<Invoice>(`/invoices/${id}`, { authenticated: true }),
  checkout: (provider: 'midtrans' | 'paypal', body: object) =>
    apiClient<Payment>(
      `/payments/${provider}/${provider === 'paypal' ? 'create-order' : 'create'}`,
      { authenticated: true, body, method: 'POST' },
    ),
  capturePaypal: (orderId: string) =>
    apiClient<Payment>('/payments/paypal/capture-order', {
      authenticated: true,
      body: { orderId },
      method: 'POST',
    }),
  enterprise: (body: object) =>
    apiClient('/enterprise/requests', {
      authenticated: true,
      body,
      method: 'POST',
    }),
  adminPlans: () =>
    apiClient<AdminPlan[]>('/admin/plans', { authenticated: true }),
  updateAdminPlan: (id: string, body: object) =>
    apiClient<AdminPlan>(`/admin/plans/${id}`, {
      authenticated: true,
      body,
      method: 'POST',
    }),
  updateAdminPlanPrice: (id: string, body: object) =>
    apiClient(`/admin/plans/${id}/prices`, {
      authenticated: true,
      body,
      method: 'POST',
    }),
  adminSettings: () =>
    apiClient<AdminSetting[]>('/admin/settings', { authenticated: true }),
  updateAdminSettings: (settings: Record<string, string | null>) =>
    apiClient<AdminSetting[]>('/admin/settings', {
      authenticated: true,
      body: { settings },
      method: 'PUT',
    }),
};
