'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

import { Alert } from '../../../../../components/ui/alert';
import { Button } from '../../../../../components/ui/button';
import { Card } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Spinner } from '../../../../../components/ui/spinner';
import { Textarea } from '../../../../../components/ui/textarea';
import { adminApi } from '../../../../../features/admin/api';
import type {
  AdminSetting,
  SettingCategory,
} from '../../../../../features/admin/types';
import { useAuth } from '../../../../../features/auth/use-auth';
import { getErrorMessage } from '../../../../../lib/utils';

const CATEGORY_MAP: Record<string, SettingCategory[]> = {
  app: ['APP'],
  billing: ['BILLING', 'CURRENCY'],
  github: ['GITHUB'],
  payments: ['MIDTRANS', 'PAYPAL'],
  scanner: ['SCANNER'],
};

export default function AdminSettingsCategoryPage() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const { isLoading, user } = useAuth({ requireAuth: true });
  const categories = useMemo<SettingCategory[]>(
    () => CATEGORY_MAP[params.category] ?? ['APP'],
    [params.category],
  );
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role !== 'ADMIN') return;
    Promise.all(categories.map((category) => adminApi.settings(category)))
      .then((groups) => {
        const next = groups.flat();
        setSettings(next);
        setValues(Object.fromEntries(next.map((item) => [item.key, item.value])));
      })
      .catch((caught) => setError(getErrorMessage(caught)));
  }, [categories, isLoading, router, user?.role]);

  async function save() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const next = await adminApi.updateSettings(
        Object.fromEntries(
          settings.map((setting) => [setting.key, values[setting.key] ?? '']),
        ),
      );
      const filtered = next.filter((setting) =>
        categories.includes(setting.category),
      );
      setSettings(filtered);
      setValues(
        Object.fromEntries(filtered.map((setting) => [setting.key, setting.value])),
      );
      setMessage('Settings saved.');
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || (user?.role === 'ADMIN' && settings.length === 0)) {
    return <Spinner />;
  }
  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">Admin settings</p>
        <h1 className="mt-2 text-3xl font-bold capitalize text-slate-950">
          {params.category} settings
        </h1>
      </div>
      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div className="grid gap-5 xl:grid-cols-2">
        {settings.map((setting) => (
          <Card className="space-y-3" key={setting.key}>
            {setting.key.includes('PRIVATE_KEY') || setting.valueType === 'JSON' ? (
              <Textarea
                label={setting.label}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setValues((current) => ({
                    ...current,
                    [setting.key]: event.target.value,
                  }))
                }
                value={values[setting.key] ?? ''}
              />
            ) : (
              <Input
                label={setting.label}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setValues((current) => ({
                    ...current,
                    [setting.key]: event.target.value,
                  }))
                }
                type={
                  setting.valueType === 'NUMBER'
                    ? 'number'
                    : setting.isSecret
                      ? 'password'
                      : 'text'
                }
                value={values[setting.key] ?? ''}
              />
            )}
            <p className="text-xs text-slate-500">{setting.description}</p>
            <p className="text-xs text-slate-400">
              Source: {setting.source}. Example: {setting.exampleValue || '-'}
            </p>
          </Card>
        ))}
      </div>
      <Button disabled={busy} onClick={() => void save()}>
        <Save className="h-4 w-4" />
        {busy ? 'Saving...' : 'Save settings'}
      </Button>
    </div>
  );
}
