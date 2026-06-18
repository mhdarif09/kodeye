'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, MessageSquareText, Phone, Save } from 'lucide-react';

import { Alert } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Select } from '../../../../components/ui/select';
import { Spinner } from '../../../../components/ui/spinner';
import { salesApi } from '../../../../features/sales/api';
import type {
  SalesInquiry,
  SalesInquiryStatus,
} from '../../../../features/sales/types';
import { useAuth } from '../../../../features/auth/use-auth';
import { getErrorMessage } from '../../../../lib/utils';

const statuses: SalesInquiryStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'WON',
  'LOST',
];

const serviceLabels: Record<string, string> = {
  'ai-automation': 'AI Automation',
  'audit-platform': 'Audit Platform',
  'devops-infrastructure': 'DevOps & Infrastructure',
  'engineering-consulting': 'Engineering Consulting',
  'not-sure': 'Not sure yet',
  'website-development': 'Website Development',
};

export default function AdminSalesInquiriesPage() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth({ requireAuth: true });
  const [filter, setFilter] = useState<SalesInquiryStatus | ''>('');
  const [items, setItems] = useState<SalesInquiry[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async (status: SalesInquiryStatus | '' = filter) => {
    setError('');
    try {
      const next = await salesApi.inquiries(status);
      setItems(next);
      setNotes(
        Object.fromEntries(next.map((item) => [item.id, item.adminNote ?? ''])),
      );
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role === 'ADMIN') void load();
  }, [authLoading, user?.role, router]);

  const counts = useMemo(
    () =>
      statuses.map((status) => ({
        status,
        value: items.filter((item) => item.status === status).length,
      })),
    [items],
  );

  async function updateInquiry(
    item: SalesInquiry,
    payload: { adminNote?: string; status?: SalesInquiryStatus },
  ) {
    setBusy(item.id);
    setError('');
    setMessage('');
    try {
      const updated = await salesApi.updateInquiry(item.id, payload);
      setItems((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      setNotes((current) => ({
        ...current,
        [updated.id]: updated.adminNote ?? '',
      }));
      setMessage('Sales inquiry updated.');
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy('');
    }
  }

  if (authLoading || (user?.role === 'ADMIN' && !items)) return <Spinner />;
  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Sales inbox
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Messages submitted from the contact sales page. Use this to qualify,
          mark follow-up status, and keep notes for the team.
        </p>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-5">
        {counts.map(({ status, value }) => (
          <Card key={status}>
            <p className="text-sm font-semibold text-slate-500">{status}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">Inquiries</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing the latest 100 contact sales messages.
            </p>
          </div>
          <Select
            className="sm:w-56"
            id="sales-filter"
            label="Filter status"
            onChange={(event) => {
              const next = event.target.value as SalesInquiryStatus | '';
              setFilter(next);
              void load(next);
            }}
            value={filter}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-5">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                    {item.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {serviceLabels[item.service] ?? item.service}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-950">
                  {item.companyName}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{item.name}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                  <a
                    className="inline-flex items-center gap-2 hover:text-brand-700"
                    href={`mailto:${item.email}`}
                  >
                    <Mail className="h-4 w-4" />
                    {item.email}
                  </a>
                  {item.phone ? (
                    <a
                      className="inline-flex items-center gap-2 hover:text-brand-700"
                      href={`tel:${item.phone}`}
                    >
                      <Phone className="h-4 w-4" />
                      {item.phone}
                    </a>
                  ) : null}
                </div>
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                    <MessageSquareText className="h-4 w-4 text-brand-600" />
                    Project context
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {item.message}
                  </p>
                </div>
              </div>

              <div className="grid content-start gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-950">
                      Budget:
                    </span>{' '}
                    {item.budget ?? 'Not provided'}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-950">
                      Timeline:
                    </span>{' '}
                    {item.timeline ?? 'Not provided'}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-950">
                      Source:
                    </span>{' '}
                    {item.source}
                  </p>
                </div>
                <Select
                  id={`status-${item.id}`}
                  label="Lead status"
                  onChange={(event) =>
                    void updateInquiry(item, {
                      status: event.target.value as SalesInquiryStatus,
                    })
                  }
                  value={item.status}
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </Select>
                <label
                  className="block space-y-2"
                  htmlFor={`note-${item.id}`}
                >
                  <span className="text-sm font-medium text-slate-700">
                    Admin note
                  </span>
                  <textarea
                    className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                    id={`note-${item.id}`}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [item.id]: event.target.value,
                      }))
                    }
                    value={notes[item.id] ?? ''}
                  />
                </label>
                <Button
                  disabled={busy === item.id}
                  onClick={() =>
                    void updateInquiry(item, { adminNote: notes[item.id] })
                  }
                >
                  <Save className="h-4 w-4" />
                  Save note
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 ? (
          <Card className="text-center text-sm text-slate-500">
            No sales inquiries found for this filter.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
