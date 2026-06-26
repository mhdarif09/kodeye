import { apiClient } from '../../lib/api-client';
import type { TeamMember, TeamMemberInput } from './types';

export const teamApi = {
  adminCreate: (input: TeamMemberInput) =>
    apiClient<TeamMember>('/admin/team/members', {
      authenticated: true,
      body: input,
      method: 'POST',
    }),
  adminDelete: (id: string) =>
    apiClient<{ id: string; success: boolean }>(
      `/admin/team/members/${id}`,
      {
        authenticated: true,
        method: 'DELETE',
      },
    ),
  adminList: () =>
    apiClient<TeamMember[]>('/admin/team/members', {
      authenticated: true,
    }),
  adminUpdate: (id: string, input: Partial<TeamMemberInput>) =>
    apiClient<TeamMember>(`/admin/team/members/${id}`, {
      authenticated: true,
      body: input,
      method: 'PATCH',
    }),
  listPublished: () => apiClient<TeamMember[]>('/team/members'),
};
