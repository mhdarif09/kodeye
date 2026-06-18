import { apiClient } from '../../lib/api-client';
import type {
  CreateSalesInquiryPayload,
  SalesInquiry,
  SalesInquiryStatus,
} from './types';

export const salesApi = {
  createInquiry: (body: CreateSalesInquiryPayload) =>
    apiClient<SalesInquiry>('/sales/inquiries', {
      body,
      method: 'POST',
    }),
  inquiries: (status?: SalesInquiryStatus | '') =>
    apiClient<SalesInquiry[]>(
      `/admin/sales-inquiries${status ? `?status=${status}` : ''}`,
      { authenticated: true },
    ),
  updateInquiry: (
    id: string,
    body: { adminNote?: string; status?: SalesInquiryStatus },
  ) =>
    apiClient<SalesInquiry>(`/admin/sales-inquiries/${id}`, {
      authenticated: true,
      body,
      method: 'PATCH',
    }),
};
