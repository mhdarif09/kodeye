'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Search, ShieldAlert, UserX } from 'lucide-react';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Spinner } from '../../../../components/ui/spinner';
import { adminApi } from '../../../../features/admin/api';
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
} from '../../../../features/admin/types';
import { useAuth } from '../../../../features/auth/use-auth';
import { getErrorMessage } from '../../../../lib/utils';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth({ requireAuth: true });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<AdminUserRole | ''>('');
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState('');

  const load = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    setLoading(true);
    try {
      setUsers(await adminApi.users({ role, search: search.trim(), status }));
      setError('');
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [role, search, status, user?.role]);

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    void load();
  }, [isLoading, load, router, user?.role]);

  async function runAction(
    target: AdminUser,
    action: () => Promise<AdminUser>,
    successMessage: string,
  ) {
    setBusyUserId(target.id);
    setError('');
    setMessage('');
    try {
      const updated = await action();
      setUsers((current) =>
        current.map((candidate) =>
          candidate.id === updated.id ? updated : candidate,
        ),
      );
      setMessage(successMessage);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusyUserId('');
    }
  }

  if (isLoading || loading) return <Spinner />;
  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          User management
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Suspend accounts, reactivate users, change roles, or soft-delete and
          anonymize accounts. Admins cannot suspend, delete, or demote
          themselves, and Kodeye protects the last active admin.
        </p>
      </div>

      <Card>
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <Input
            id="admin-user-search"
            label="Search users"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email, or user ID"
            value={search}
          />
          <Select
            id="admin-user-role"
            label="Role"
            onChange={(event) => setRole(event.target.value as AdminUserRole)}
            value={role}
          >
            <option value="">All roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </Select>
          <Select
            id="admin-user-status"
            label="Status"
            onChange={(event) =>
              setStatus(event.target.value as AdminUserStatus)
            }
            value={status}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="DELETED">DELETED</option>
          </Select>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => void load()}>
              <Search className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>
      </Card>

      {error ? <Card className="text-sm text-red-600">{error}</Card> : null}
      {message ? (
        <Card className="text-sm text-emerald-700">{message}</Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[1.3fr_140px_150px_1fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {users.map((item) => (
          <div
            className="grid gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-0 lg:grid-cols-[1.3fr_140px_150px_1fr] lg:items-center"
            key={item.id}
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">
                {item.name}
              </p>
              <p className="truncate text-slate-500">{item.email}</p>
            </div>
            <div>
              <Select
                aria-label={`Role for ${item.email}`}
                disabled={item.id === user.id || item.status === 'DELETED'}
                onChange={(event) =>
                  void runAction(
                    item,
                    () =>
                      adminApi.updateUserRole(
                        item.id,
                        event.target.value as AdminUserRole,
                      ),
                    'User role updated.',
                  )
                }
                value={item.role}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </Select>
            </div>
            <div>
              <StatusBadge status={item.status} />
              {item.suspendedAt ? (
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(item.suspendedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.status === 'ACTIVE' ? (
                <Button
                  disabled={busyUserId === item.id || item.id === user.id}
                  onClick={() => {
                    if (!window.confirm(`Suspend ${item.email}?`)) return;
                    void runAction(
                      item,
                      () => adminApi.suspendUser(item.id),
                      'User suspended.',
                    );
                  }}
                  variant="secondary"
                >
                  <ShieldAlert className="h-4 w-4" /> Suspend
                </Button>
              ) : item.status === 'SUSPENDED' ? (
                <Button
                  disabled={busyUserId === item.id}
                  onClick={() =>
                    void runAction(
                      item,
                      () => adminApi.reactivateUser(item.id),
                      'User reactivated.',
                    )
                  }
                  variant="secondary"
                >
                  <RefreshCw className="h-4 w-4" /> Reactivate
                </Button>
              ) : null}
              <Button
                disabled={
                  busyUserId === item.id ||
                  item.id === user.id ||
                  item.status === 'DELETED'
                }
                onClick={() => {
                  if (
                    !window.confirm(
                      `Soft-delete and anonymize ${item.email}? This cannot be reactivated.`,
                    )
                  ) {
                    return;
                  }
                  void runAction(
                    item,
                    () => adminApi.deleteUser(item.id),
                    'User soft-deleted and anonymized.',
                  );
                }}
                variant="danger"
              >
                <UserX className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {users.length === 0 ? (
          <div className="px-5 py-8 text-sm text-slate-500">
            No users match the current filters.
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminUserStatus }) {
  const tone =
    status === 'ACTIVE'
      ? 'success'
      : status === 'SUSPENDED'
        ? 'warning'
        : 'danger';
  return <Badge tone={tone}>{status}</Badge>;
}
