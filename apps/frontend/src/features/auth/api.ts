import { apiClient } from '../../lib/api-client';
import type { AuthResult, LoginInput, RegisterInput, User } from './types';

export const authApi = {
  login: (input: LoginInput) =>
    apiClient<AuthResult>('/auth/login', { body: input, method: 'POST' }),
  me: () => apiClient<User>('/auth/me', { authenticated: true }),
  register: (input: RegisterInput) =>
    apiClient<AuthResult>('/auth/register', { body: input, method: 'POST' }),
  updateProfile: (name: string) =>
    apiClient<User>('/users/me', {
      authenticated: true,
      body: { name },
      method: 'PATCH',
    }),
};
