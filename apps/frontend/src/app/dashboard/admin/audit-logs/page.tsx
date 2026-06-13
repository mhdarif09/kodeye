'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Spinner } from '../../../../components/ui/spinner';
import { adminApi } from '../../../../features/admin/api';
import type { AdminAuditLog } from '../../../../features/admin/types';
import { useAuth } from '../../../../features/auth/use-auth';
import { getErrorMessage } from '../../../../lib/utils';

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth({ requireAuth: true });
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role !== 'ADMIN') return;
    adminApi.auditLogs().then(setLogs).catch((caught) => {
      setError(getErrorMessage(caught));
    });
  }, [isLoading, router, user?.role]);

  if (isLoading) return <Spinner />;
  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Audit logs
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Track admin settings updates, secret clears, reloads, and provider
          tests. Secret values are never stored in the audit metadata.
        </p>
      </div>
      {error ? <Card className="text-red-600">{error}</Card> : null}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Time</span>
          <span>Actor</span>
          <span>Action</span>
          <span>Resource</span>
        </div>
        {logs.map((log) => (
          <div
            className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center border-b border-slate-100 px-5 py-3 text-sm last:border-0"
            key={log.id}
          >
            <span className="text-slate-500">
              {new Date(log.createdAt).toLocaleString()}
            </span>
            <span>{log.actor?.email ?? 'system'}</span>
            <span>
              <Badge tone="primary">{log.action}</Badge>
            </span>
            <span className="text-slate-600">
              {log.resourceKey ?? log.resourceType}
            </span>
          </div>
        ))}
        {logs.length === 0 ? (
          <div className="px-5 py-8 text-sm text-slate-500">
            No audit logs yet.
          </div>
        ) : null}
      </Card>
    </div>
  );
}
