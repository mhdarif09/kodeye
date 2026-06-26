import { getApiUrl } from '../../lib/api-client';
import type { ApiSuccessResponse } from '../../types/api';
import type { TeamMember } from './types';

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  return fetchTeam<TeamMember[]>('/team/members').catch(() => []);
}

async function fetchTeam<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 },
  });
  if (!response.ok) {
    throw new Error(`Team API returned ${response.status}`);
  }
  const payload = (await response.json()) as ApiSuccessResponse<T>;
  if (!payload.success) {
    throw new Error(payload.message || 'Team API returned an error');
  }
  return payload.data;
}
