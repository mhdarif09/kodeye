'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { GlobalLoadingScreen } from '../../../components/layout/global-loading-screen';
import { Alert } from '../../../components/ui/alert';
import {
  isOnboardingCompleted,
  setAccessToken,
  setAuthSource,
} from '../../../lib/auth-token';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('GitHub authentication did not return a Kodeye access token.');
      return;
    }
    // TODO: Replace URL token delivery with one-time exchange or HttpOnly cookie.
    setAccessToken(token);
    setAuthSource(
      searchParams.get('auth_source') === 'email' ? 'email' : 'github',
    );
    window.history.replaceState({}, '', '/auth/callback');
    const installOrganizationId = searchParams.get('organization_id');
    const needsGitHubInstall =
      searchParams.get('install_github_app') === 'true' &&
      installOrganizationId;
    const onboardingPath = needsGitHubInstall
      ? `/onboarding?organization_id=${encodeURIComponent(installOrganizationId)}`
      : '/onboarding';
    router.replace(
      isOnboardingCompleted() ? '/dashboard' : onboardingPath,
    );
  }, [router, searchParams]);

  return (
    <>
      {error ? (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft">
            <>
              <Alert tone="error">{error}</Alert>
              <Link
              className="mt-5 inline-flex font-semibold text-brand-600"
              href="/login"
            >
              Return to sign in
            </Link>
            </>
          </div>
        </main>
      ) : (
        <GlobalLoadingScreen message="Completing GitHub sign in..." />
      )}
    </>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
