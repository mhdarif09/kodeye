export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResult {
  accessToken: string;
  authSource?: 'email' | 'github';
  githubInstallOrganizationId?: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}
