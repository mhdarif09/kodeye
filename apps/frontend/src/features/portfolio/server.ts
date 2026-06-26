import { getApiUrl } from '../../lib/api-client';
import type { ApiSuccessResponse } from '../../types/api';
import type { PortfolioProject } from './types';

export async function getPublishedPortfolioProjects(): Promise<PortfolioProject[]> {
  return fetchPortfolio<PortfolioProject[]>('/portfolio/projects').catch(() => []);
}

async function fetchPortfolio<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 },
  });
  if (!response.ok) {
    throw new Error(`Portfolio API returned ${response.status}`);
  }
  const payload = (await response.json()) as ApiSuccessResponse<T>;
  if (!payload.success) {
    throw new Error(payload.message || 'Portfolio API returned an error');
  }
  return payload.data;
}
