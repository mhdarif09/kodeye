export interface GitHubInstallationDetails {
  id: number;
  account: {
    login: string;
    type: string;
  };
  target_type: string | null;
  permissions: Record<string, string>;
  repository_selection: string;
}

export interface GitHubInstallationState {
  userId: string;
  organizationId: string;
}
