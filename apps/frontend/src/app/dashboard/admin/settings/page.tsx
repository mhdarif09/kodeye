'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  RotateCcw,
  Save,
  ShieldAlert,
  TestTube2,
} from 'lucide-react';

import { Alert } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Spinner } from '../../../../components/ui/spinner';
import { Textarea } from '../../../../components/ui/textarea';
import { adminApi } from '../../../../features/admin/api';
import type { AdminSetting } from '../../../../features/admin/types';
import { useAuth } from '../../../../features/auth/use-auth';
import { getErrorMessage } from '../../../../lib/utils';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth({ requireAuth: true });
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role !== 'ADMIN') return;

    let cancelled = false;
    async function loadSettings() {
      setError('');
      try {
        const next = await adminApi.settings();
        if (cancelled) return;
        setSettings(next);
        setValues(
          Object.fromEntries(next.map((setting) => [setting.key, setting.value])),
        );
      } catch (caught) {
        if (!cancelled) setError(getErrorMessage(caught));
      }
    }

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, [authLoading, router, user?.role]);

  const groups = useMemo(
    () =>
      Object.entries(
        settings.reduce<Record<string, AdminSetting[]>>((result, setting) => {
          (result[setting.category] ??= []).push(setting);
          return result;
        }, {}),
      ),
    [settings],
  );

  async function saveSettings() {
    setBusy('settings');
    setError('');
    setMessage('');
    try {
      const payload = Object.fromEntries(
        settings.map((setting) => [setting.key, values[setting.key] ?? '']),
      );
      const next = await adminApi.updateSettings(payload);
      setSettings(next);
      setValues(
        Object.fromEntries(next.map((setting) => [setting.key, setting.value])),
      );
      setMessage('Admin settings saved. New backend requests will use them.');
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy('');
    }
  }

  async function clearDashboardOverride(key: string) {
    setBusy(key);
    setError('');
    setMessage('');
    try {
      const cleared = await adminApi.clearSecret(key);
      setSettings((current) =>
        current.map((setting) => (setting.key === key ? cleared : setting)),
      );
      setValues((current) => ({ ...current, [key]: cleared.value }));
      setMessage(`${key} now falls back to the environment value.`);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy('');
    }
  }

  async function testProvider(
    provider: 'github' | 'midtrans' | 'paypal' | 'currency',
  ) {
    setBusy(provider);
    setError('');
    setTestResult('');
    try {
      const result = await adminApi.testProvider(provider);
      setTestResult(
        `${provider}: ${result.status} - ${result.message}${
          result.missingKeys.length
            ? ` Missing: ${result.missingKeys.join(', ')}`
            : ''
        }`,
      );
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy('');
    }
  }

  async function reloadSettings() {
    setBusy('reload');
    setError('');
    setMessage('');
    try {
      await adminApi.reloadSettings();
      const next = await adminApi.settings();
      setSettings(next);
      setValues(
        Object.fromEntries(next.map((setting) => [setting.key, setting.value])),
      );
      setMessage('Settings cache reloaded.');
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy('');
    }
  }

  if (authLoading || (user?.role === 'ADMIN' && settings.length === 0)) {
    return <Spinner />;
  }
  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Backend settings
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Manage Midtrans, PayPal, GitHub, billing, callback, report, and
          automation configuration from the dashboard. Secrets are encrypted in
          the database and are never returned in full.
        </p>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}
      {testResult ? <Alert tone="success">{testResult}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <Alert>
        Leave masked secret values unchanged to keep the current credential.
        Database URL, JWT secret, and the settings encryption key stay
        environment-only.
      </Alert>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-950">Provider tests</h2>
            <p className="mt-1 text-sm text-slate-500">
              Validate provider credentials without exposing tokens or creating
              payments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['github', 'midtrans', 'paypal', 'currency'] as const).map(
              (provider) => (
                <Button
                  disabled={busy === provider}
                  key={provider}
                  onClick={() => void testProvider(provider)}
                  variant="secondary"
                >
                  <TestTube2 className="h-4 w-4" />
                  Test {provider}
                </Button>
              ),
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {groups.map(([category, items]) => (
          <Card className="space-y-4 p-5" key={category}>
            <div className="flex items-center gap-2">
              {items.some((setting) => setting.sensitive) ? (
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              ) : (
                <KeyRound className="h-5 w-5 text-brand-600" />
              )}
              <h2 className="text-lg font-bold text-slate-950">{category}</h2>
            </div>

            {items.map((setting) => {
              const fieldValue = values[setting.key] ?? '';
              const sharedProps = {
                label: setting.label,
                onChange: (
                  event:
                    | ChangeEvent<HTMLInputElement>
                    | ChangeEvent<HTMLTextAreaElement>,
                ) =>
                  setValues((current) => ({
                    ...current,
                    [setting.key]: event.target.value,
                  })),
                value: fieldValue,
              };
              return (
                <div className="space-y-2" key={setting.key}>
                  {setting.key.includes('PRIVATE_KEY') ? (
                    <Textarea {...sharedProps} rows={6} />
                  ) : (
                    <Input
                      {...sharedProps}
                      type={setting.sensitive ? 'password' : 'text'}
                    />
                  )}
                  <div className="flex items-start justify-between gap-3 text-xs text-slate-500">
                    <span>{setting.description}</span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1">
                      {setting.source}
                    </span>
                  </div>
                  {setting.isSecret && setting.configured ? (
                    <button
                      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                      disabled={busy === setting.key}
                      onClick={() => void clearDashboardOverride(setting.key)}
                      type="button"
                    >
                      Clear secret
                    </button>
                  ) : null}
                </div>
              );
            })}
          </Card>
        ))}
      </div>

      <Button disabled={busy === 'settings'} onClick={() => void saveSettings()}>
        <Save className="h-4 w-4" />
        {busy === 'settings' ? 'Saving...' : 'Save backend settings'}
      </Button>
      <Button
        disabled={busy === 'reload'}
        onClick={() => void reloadSettings()}
        variant="secondary"
      >
        <RotateCcw className="h-4 w-4" />
        Reload settings cache
      </Button>
    </div>
  );
}
