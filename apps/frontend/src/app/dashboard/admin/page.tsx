'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  FolderGit2,
  KeyRound,
  ListChecks,
  MessageSquareText,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

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
    adminApi
      .dashboard()
      .then(setSummary)
      .catch((caught) => {
        setError(getErrorMessage(caught));
      });
  }, [isLoading, router, user?.role]);

  if (isLoading || (user?.role === 'ADMIN' && !summary)) return <Spinner />;
  if (user?.role !== 'ADMIN') return null;

  const stats: { icon: LucideIcon; label: string; value: number }[] = summary
    ? [
        { icon: UsersRound, label: 'Admin Users', value: summary.totalUsers },
        {
          icon: FolderGit2,
          label: 'Portfolio Projects',
          value: summary.totalProjects,
        },
        { icon: FileText, label: 'Blog Posts', value: summary.totalBlogPosts },
        {
          icon: MessageSquareText,
          label: 'Sales Inquiries',
          value: summary.totalSalesInquiries,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">Admin Console</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Agency CMS Dashboard Hub
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Kelola seluruh konten website agensi Kodeye: portofolio proyek, artikel blog, profil tim, klien mitra, dan pesan masuk.
        </p>
      </div>
      {error ? <Card className="text-red-600">{error}</Card> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[
          {
            href: '/dashboard/admin/portfolio',
            icon: FolderGit2,
            label: 'Our Projects',
            text: 'Kelola kartu proyek portofolio yang tampil di halaman utama.',
          },
          {
            href: '/dashboard/admin/sales-inquiries',
            icon: MessageSquareText,
            label: 'Sales Inbox',
            text: 'Lihat pesan prospek dari form WhatsApp/Contact Sales.',
          },
          {
            href: '/dashboard/admin/blog',
            icon: FileText,
            label: 'Blog CMS',
            text: 'Tulis, edit, dan terbitkan artikel edukasi AI & Digital.',
          },
          {
            href: '/dashboard/admin/team',
            icon: UsersRound,
            label: 'Our Team',
            text: 'Kelola profil anggota tim teknis, foto, dan link sosial.',
          },
          {
            href: '/dashboard/admin/partners',
            icon: ShieldCheck,
            label: 'Trusted Partners',
            text: 'Kelola logo perusahaan klien yang memercayai Kodeye.',
          },
          {
            href: '/dashboard/admin/users',
            icon: UsersRound,
            label: 'Admin Users',
            text: 'Kelola hak akses dan akun administrator sistem.',
          },
          {
            href: '/dashboard/admin/settings',
            icon: KeyRound,
            label: 'System Settings',
            text: 'Konfigurasi parameter aplikasi dan kunci keamanan.',
          },
          {
            href: '/dashboard/admin/audit-logs',
            icon: ListChecks,
            label: 'Audit Logs',
            text: 'Pantau jejak aktivitas perubahan oleh para admin.',
          },
        ].map(({ href, icon: Icon, label, text }) => (
          <Link
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
            href={href}
            key={href}
          >
            <Icon className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 font-bold text-slate-950">{label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <Icon className="h-5 w-5 text-brand-600" />
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold text-slate-950">Recent Sales Inquiries</h2>
          <div className="mt-4 space-y-3">
            {summary?.recentInquiries.map((inq) => (
              <div className="rounded-xl bg-slate-50 p-3 text-sm" key={inq.id}>
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{inq.name} ({inq.companyName})</span>
                  <span className="text-xs text-brand-600 uppercase">{inq.status}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {inq.service} - {inq.email}
                </div>
              </div>
            ))}
            {summary?.recentInquiries.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada pesan masuk.</p>
            ) : null}
          </div>
        </Card>
        <Card>
          <h2 className="font-bold text-slate-950">Recent Audit Logs</h2>
          <div className="mt-4 space-y-3">
            {summary?.recentAuditLogs.map((log) => (
              <div className="rounded-xl bg-slate-50 p-3 text-sm" key={log.id}>
                <div className="font-semibold text-slate-900">{log.action}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {log.resourceKey ?? log.resourceType} —{' '}
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
