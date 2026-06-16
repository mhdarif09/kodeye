'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Alert } from '../../../components/ui/alert';
import { Spinner } from '../../../components/ui/spinner';
import { setAccessToken } from '../../../lib/auth-token';

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
    window.history.replaceState({}, '', '/auth/callback');
    const installOrganizationId = searchParams.get('organization_id');
    router.replace(
      searchParams.get('install_github_app') === 'true' && installOrganizationId
        ? `/dashboard/integrations/github?auto_install=true&organization_id=${encodeURIComponent(installOrganizationId)}`
        : '/dashboard',
    );
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft">
        {error ? (
          <>
            <Alert tone="error">{error}</Alert>
            <Link
              className="mt-5 inline-flex font-semibold text-brand-600"
              href="/login"
            >
              Return to sign in
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Spinner />
            <h1 className="font-bold text-slate-950">
              Completing GitHub sign in
            </h1>
            <p className="text-sm text-slate-500">
              Your secure Kodeye session is being prepared.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
