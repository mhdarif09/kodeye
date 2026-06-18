'use client';

import { Eye, EyeOff, Github } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { AuthShell } from '../../components/layout/auth-shell';
import { GlobalLoadingScreen } from '../../components/layout/global-loading-screen';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../features/auth/use-auth';
import { getApiUrl } from '../../lib/api-client';
import { isOnboardingCompleted } from '../../lib/auth-token';
import { getErrorMessage } from '../../lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { isLoading, login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user)
      router.replace(isOnboardingCompleted() ? '/dashboard' : '/onboarding');
  }, [isLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || user) {
    return <GlobalLoadingScreen message="Restoring your session..." />;
  }

  return (
    <AuthShell
      description="Sign in with GitHub for repository sync, or use email if you are starting with services or manual setup."
      title="Continue to Kodeye"
    >
      <Button
        className="w-full"
        onClick={() => window.location.assign(getApiUrl('/auth/github'))}
        type="button"
      >
        <Github className="h-5 w-5" />
        Continue with GitHub
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or use email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input
          id="email"
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <div className="relative">
          <Input
            id="password"
            label="Password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute bottom-2 right-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in...' : 'Sign in with email'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Kodeye?{' '}
        <Link
          className="font-semibold text-brand-600 hover:text-brand-700"
          href="/register"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
