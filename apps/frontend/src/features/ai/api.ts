import { apiClient } from '../../lib/api-client';
import type { AiFindingReview, AiFixProposal, AiFixPullRequest } from './types';

export const aiApi = {
  reviewFinding: (findingId: string, question?: string) =>
    apiClient<AiFindingReview>(`/ai/findings/${findingId}/review`, {
      authenticated: true,
      body: { question },
      method: 'POST',
    }),
  generateFix: (findingId: string, instruction?: string) =>
    apiClient<AiFixProposal>(`/ai/findings/${findingId}/fix`, {
      authenticated: true,
      body: { instruction },
      method: 'POST',
    }),
  createFixPullRequest: (
    findingId: string,
    proposal: Pick<
      AiFixProposal,
      | 'approvalToken'
      | 'commitMessage'
      | 'proposedContent'
      | 'sourceSha'
      | 'title'
    >,
  ) =>
    apiClient<AiFixPullRequest>(`/ai/findings/${findingId}/fix/pull-request`, {
      authenticated: true,
      body: proposal,
      method: 'POST',
    }),
};
