import { getApiUrl } from '../../lib/api-client';
import type { ApiSuccessResponse } from '../../types/api';
import type { TrustedCompany } from './types';

export async function getPublishedTrustedCompanies(): Promise<TrustedCompany[]> {
  return fetchPartners<TrustedCompany[]>('/partners/companies').catch(() => []);
}

async function fetchPartners<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 },
  });
  if (!response.ok) {
    throw new Error(`Partners API returned ${response.status}`);
  }
  const payload = (await response.json()) as ApiSuccessResponse<T>;
  if (!payload.success) {
    throw new Error(payload.message || 'Partners API returned an error');
  }
  return payload.data;
}
