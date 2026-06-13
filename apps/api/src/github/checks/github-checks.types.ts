export interface GitHubCheckRunResponse {
  id: number;
  html_url: string;
}

export type GitHubCheckConclusion = 'failure' | 'success';
