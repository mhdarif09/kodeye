'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, KeyRound, Save, SlidersHorizontal } from 'lucide-react';

import { Alert } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Spinner } from '../../../../components/ui/spinner';
import { useAuth } from '../../../../features/auth/use-auth';
import { billingApi } from '../../../../features/billing/api';
import type {
  AdminPlan,
  AdminSetting,
  CurrencyCode,
} from '../../../../features/billing/types';

export default function AdminBilling() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth({ requireAuth: true });
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [settingValues, setSettingValues] = useState<Record<string, string>>(
    {},
  );
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [nextPlans, nextSettings] = await Promise.all([
        billingApi.adminPlans(),
        billingApi.adminSettings(),
      ]);
      setPlans(nextPlans);
      setSettings(nextSettings);
      setSettingValues(
        Object.fromEntries(
          nextSettings.map((setting) => [setting.key, setting.value]),
        ),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to load admin billing.',
      );
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role === 'ADMIN') void load();
  }, [authLoading, user?.role, router]);

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

  const saveSettings = async () => {
    setBusy('settings');
    setError('');
    setMessage('');
    try {
      const values = Object.fromEntries(
        settings.map((setting) => [
          setting.key,
          settingValues[setting.key] ?? '',
        ]),
      );
      const next = await billingApi.updateAdminSettings(values);
      setSettings(next);
      setSettingValues(
        Object.fromEntries(next.map((setting) => [setting.key, setting.value])),
      );
      setMessage('Backend settings saved and applied.');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to save settings.',
      );
    } finally {
      setBusy('');
    }
  };

  const clearSetting = async (key: string) => {
    setBusy(key);
    try {
      const next = await billingApi.updateAdminSettings({ [key]: null });
      setSettings(next);
      setSettingValues(
        Object.fromEntries(next.map((setting) => [setting.key, setting.value])),
      );
      setMessage(`${key} now uses environment fallback.`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to clear setting.',
      );
    } finally {
      setBusy('');
    }
  };

  if (authLoading || (user?.role === 'ADMIN' && settings.length === 0))
    return <Spinner />;
  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">
          Admin control center
        </h1>
        <p className="mt-2 max-w-3xl text-slate-500">
          Manage plans and encrypted backend credentials without editing source
          code. Database URL, JWT secret, and the settings encryption key remain
          environment-only.
        </p>
      </div>
      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-brand-600" />
          <h2 className="text-xl font-bold">Plans and limits</h2>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {plans.map((plan) => (
            <PlanEditor
              key={plan.id}
              plan={plan}
              onSaved={(next) =>
                setPlans((current) =>
                  current.map((item) =>
                    item.id === next.id ? { ...item, ...next } : item,
                  ),
                )
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-brand-600" />
          <h2 className="text-xl font-bold">
            Backend settings and credentials
          </h2>
        </div>
        <Alert>
          Secrets are encrypted at rest and never returned in full. Leave a
          masked value unchanged to keep the existing secret.
        </Alert>
        <div className="grid gap-5 xl:grid-cols-2">
          {groups.map(([category, items]) => (
            <Card className="space-y-4 p-5" key={category}>
              <h3 className="text-lg font-bold text-slate-950">{category}</h3>
              {items.map((setting) => (
                <div className="space-y-2" key={setting.key}>
                  <Input
                    label={setting.label}
                    onChange={(event) =>
                      setSettingValues((current) => ({
                        ...current,
                        [setting.key]: event.target.value,
                      }))
                    }
                    type={setting.sensitive ? 'password' : 'text'}
                    value={settingValues[setting.key] ?? ''}
                  />
                  <div className="flex items-start justify-between gap-3 text-xs text-slate-500">
                    <span>{setting.description}</span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1">
                      {setting.source}
                    </span>
                  </div>
                  {setting.source === 'dashboard' ? (
                    <button
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                      disabled={busy === setting.key}
                      onClick={() => void clearSetting(setting.key)}
                      type="button"
                    >
                      Clear dashboard override
                    </button>
                  ) : null}
                </div>
              ))}
            </Card>
          ))}
        </div>
        <Button
          disabled={busy === 'settings'}
          onClick={() => void saveSettings()}
        >
          <Save className="h-4 w-4" />
          Save backend settings
        </Button>
      </section>
    </div>
  );
}

function PlanEditor({
  plan,
  onSaved,
}: {
  plan: AdminPlan;
  onSaved: (plan: AdminPlan) => void;
}) {
  const [draft, setDraft] = useState(plan);
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [override, setOverride] = useState(
    plan.prices.find((price) => price.currencyCode === 'IDR')?.amount ?? 0,
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof AdminPlan, value: unknown) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setBusy(true);
    setSaved(false);
    const next = await billingApi.updateAdminPlan(plan.id, {
      basePriceIdr: draft.basePriceIdr,
      description: draft.description ?? '',
      enableGithubAutoScan: draft.enableGithubAutoScan,
      enablePdfReport: draft.enablePdfReport,
      enableRecurring: draft.enableRecurring,
      isActive: draft.isActive,
      maxRepositories: draft.maxRepositories,
      maxScansPerMonth: draft.maxScansPerMonth,
      name: draft.name,
      requiresManualApproval: draft.requiresManualApproval,
    });
    await billingApi.updateAdminPlanPrice(plan.id, {
      amount: override,
      currencyCode: currency,
    });
    onSaved({ ...draft, ...next });
    setBusy(false);
    setSaved(true);
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950">{draft.name}</h3>
          <p className="text-xs text-slate-500">{draft.code}</p>
        </div>
        {saved ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}
      </div>
      <Input
        label="Name"
        value={draft.name}
        onChange={(e) => update('name', e.target.value)}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label="Base IDR"
          min="0"
          type="number"
          value={draft.basePriceIdr ?? 0}
          onChange={(e) => update('basePriceIdr', Number(e.target.value))}
        />
        <Input
          label="Repositories"
          min="0"
          type="number"
          value={draft.maxRepositories}
          onChange={(e) => update('maxRepositories', Number(e.target.value))}
        />
        <Input
          label="Scans / month"
          min="0"
          type="number"
          value={draft.maxScansPerMonth}
          onChange={(e) => update('maxScansPerMonth', Number(e.target.value))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Override currency"
          value={currency}
          onChange={(e) => {
            const next = e.target.value as CurrencyCode;
            setCurrency(next);
            setOverride(
              draft.prices.find((price) => price.currencyCode === next)
                ?.amount ?? 0,
            );
          }}
        >
          {(['IDR', 'USD', 'EUR', 'SGD'] as const).map((code) => (
            <option key={code}>{code}</option>
          ))}
        </Select>
        <Input
          label="Override amount (minor unit)"
          min="0"
          type="number"
          value={override}
          onChange={(e) => setOverride(Number(e.target.value))}
        />
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        {[
          ['isActive', 'Plan active'],
          ['enablePdfReport', 'PDF reports'],
          ['enableGithubAutoScan', 'GitHub auto scan'],
          ['enableRecurring', 'Recurring billing'],
          ['requiresManualApproval', 'Manual approval'],
        ].map(([key, label]) => (
          <label className="flex items-center gap-2" key={key}>
            <input
              checked={Boolean(draft[key as keyof AdminPlan])}
              onChange={(e) => update(key as keyof AdminPlan, e.target.checked)}
              type="checkbox"
            />
            {label}
          </label>
        ))}
      </div>
      <Button disabled={busy} onClick={() => void save()}>
        <Save className="h-4 w-4" />
        Save plan
      </Button>
    </Card>
  );
}
