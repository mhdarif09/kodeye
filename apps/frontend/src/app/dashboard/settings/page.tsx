'use client';

import { LogOut, UserRound } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import { Alert } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { authApi } from '../../../features/auth/api';
import { useAuth } from '../../../features/auth/use-auth';
import { getErrorMessage } from '../../../lib/utils';

export default function SettingsPage() {
  const { logout, setUser, user } = useAuth({ requireAuth: true });
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const updatedUser = await authApi.updateProfile(name);
      setUser(updatedUser);
      setSuccess('Profile updated successfully.');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-brand-600">Settings</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        Profile settings
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        Keep the name shown across your Kodeye workspace up to date.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.55fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950">Personal information</h2>
              <p className="text-sm text-slate-500">
                Only your display name can be changed in Phase 3.
              </p>
            </div>
          </div>
          {error ? (
            <Alert className="mt-5" tone="error">
              {error}
            </Alert>
          ) : null}
          {success ? (
            <Alert className="mt-5" tone="success">
              {success}
            </Alert>
          ) : null}
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <Input
              id="profile-name"
              label="Name"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
            <Input
              disabled
              id="profile-email"
              label="Email"
              value={user?.email ?? ''}
            />
            <Button disabled={isSubmitting || !user} type="submit">
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-950">Account</h2>
            <Badge tone="primary">{user?.role ?? 'USER'}</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Signing out removes the access token stored on this device.
          </p>
          <Button className="mt-6 w-full" onClick={logout} variant="danger">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}
