'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../../lib/auth-token';
import { authApi } from './api';
import type { AuthResult, LoginInput, RegisterInput, User } from './types';

export function useAuth(options: { requireAuth?: boolean } = {}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      if (options.requireAuth) router.replace('/login');
      return null;
    }

    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
      return currentUser;
    } catch {
      clearAccessToken();
      setUser(null);
      if (options.requireAuth) router.replace('/login');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options.requireAuth, router]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const completeAuth = (result: AuthResult) => {
    setAccessToken(result.accessToken);
    setUser(result.user);
    router.push(
      result.githubInstallOrganizationId
        ? `/dashboard/integrations/github?auto_install=true&organization_id=${encodeURIComponent(result.githubInstallOrganizationId)}`
        : '/dashboard',
    );
  };

  return {
    isLoading,
    login: async (input: LoginInput) =>
      completeAuth(await authApi.login(input)),
    logout: () => {
      clearAccessToken();
      setUser(null);
      router.replace('/login');
    },
    refreshUser,
    register: async (input: RegisterInput) =>
      completeAuth(await authApi.register(input)),
    setUser,
    user,
  };
}
