'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, CreditCard, ShieldCheck, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Spinner } from '../../../components/ui/spinner';
import { adminApi } from '../../../features/admin/api';
import type { AdminDashboardSummary } from '../../../features/admin/types';
import { useAuth } from '../../../features/auth/use-auth';
import { getErrorMessage } from '../../../lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth({ requireAuth: true });
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role !== 'ADMIN') return;
    adminApi.dashboard().then(setSummary).catch((caught) => {
      setError(getErrorMessage(caught));
    });
  }, [isLoading, router, user?.role]);

  if (isLoading || (user?.role === 'ADMIN' && !summary)) return <Spinner />;
  if (user?.role !== 'ADMIN') return null;

  const stats: { icon: LucideIcon; label: string; value: number }[] = summary
    ? [
        { icon: UsersRound, label: 'Users', value: summary.totalUsers },
        {
          icon: ShieldCheck,
          label: 'Repositories',
          value: summary.totalRepositories,
        },
        { icon: Activity, label: 'Scans', value: summary.totalScanJobs },
        {
          icon: CreditCard,
          label: 'Paid IDR',
          value: summary.monthlyRevenue.totalAmount,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Admin console
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          System overview, provider status, recent scans, payments, and audit
          activity.
        </p>
      </div>
      {error ? <Card className="text-red-600">{error}</Card> : null}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <Icon className="h-5 w-5 text-brand-600" />
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-bold text-slate-950">Provider status</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(summary?.providerStatus ?? {}).map(([key, ok]) => (
            <Badge key={key} tone={ok ? 'success' : 'warning'}>
              {key}: {ok ? 'configured' : 'missing'}
            </Badge>
          ))}
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold text-slate-950">Recent scans</h2>
          <div className="mt-4 space-y-3">
            {summary?.recentScans.map((scan) => (
              <div className="rounded-xl bg-slate-50 p-3 text-sm" key={scan.id}>
                <div className="font-semibold">{scan.repository.name}</div>
                <div className="text-slate-500">
                  {scan.status} · {scan.totalFindings} findings
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-bold text-slate-950">Recent audit logs</h2>
          <div className="mt-4 space-y-3">
            {summary?.recentAuditLogs.map((log) => (
              <div className="rounded-xl bg-slate-50 p-3 text-sm" key={log.id}>
                <div className="font-semibold">{log.action}</div>
                <div className="text-slate-500">
                  {log.resourceKey ?? log.resourceType} ·{' '}
                  {log.actor?.email ?? 'system'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
