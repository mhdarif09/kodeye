'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { dashboardNavigation } from '../../lib/routes';
import { cn } from '../../lib/utils';
import { useAuth } from '../../features/auth/use-auth';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const navigation = dashboardNavigation.filter(
    ({ href }) =>
      !href.startsWith('/dashboard/admin') || user?.role === 'ADMIN',
  );

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-6 lg:block">
      <Link className="flex items-center gap-3 px-2" href="/dashboard">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-950">
          Kodeye
        </span>
      </Link>
      <nav className="mt-8 space-y-1">
        {navigation.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(`${href}/`));
          return (
            <Link
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
              )}
              href={href}
              key={href}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-6 left-4 right-4 rounded-xl bg-slate-950 p-4 text-white">
        <p className="text-sm font-semibold">Security scan foundation</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Create jobs locally. Real scanners run in the future VPS worker.
        </p>
      </div>
    </aside>
  );
}
