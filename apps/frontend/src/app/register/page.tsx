'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { AuthShell } from '../../components/layout/auth-shell';
import { GlobalLoadingScreen } from '../../components/layout/global-loading-screen';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../features/auth/use-auth';
import { getErrorMessage } from '../../lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { isLoading, register, user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN') {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/dashboard/settings');
      }
    }
  }, [isLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(form);
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
      description="Buat akun baru untuk mengelola agensi digital Kodeye."
      title="Create Account"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input
          id="name"
          label="Name"
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Nama Lengkap"
          required
          value={form.name}
        />
        <Input
          id="email"
          label="Email"
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="you@example.com"
          required
          type="email"
          value={form.email}
        />
        <div className="relative">
          <Input
            id="password"
            label="Password"
            minLength={8}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
            type={showPassword ? 'text' : 'password'}
            value={form.password}
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          className="font-semibold text-brand-600 hover:text-brand-700"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
