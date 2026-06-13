export interface WebhookRepository {
  id: number;
  name: string;
  full_name: string;
  html_url?: string;
  clone_url?: string;
  default_branch?: string;
  private?: boolean;
  archived?: boolean;
}

export interface GitHubWebhookPayload {
  action?: string;
  after?: string;
  ref?: string;
  installation?: { id: number };
  repositories_added?: WebhookRepository[];
  repositories_removed?: WebhookRepository[];
  repository?: WebhookRepository;
  pull_request?: {
    draft: boolean;
    head: { ref: string; sha: string };
    number?: number;
  };
  number?: number;
}
