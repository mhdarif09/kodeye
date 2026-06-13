'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { dashboardNavigation } from '../../lib/routes';
import { cn } from '../../lib/utils';
import { useAuth } from '../../features/auth/use-auth';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const navigation = dashboardNavigation.filter(
    ({ href }) =>
      !href.startsWith('/dashboard/admin') || user?.role === 'ADMIN',
  );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200 bg-white/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      {navigation.map(({ href, icon: Icon, label }) => {
        const active =
          pathname === href ||
          (href !== '/dashboard' && pathname.startsWith(`${href}/`));
        return (
          <Link
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium',
              active ? 'text-brand-700' : 'text-slate-500',
            )}
            href={href}
            key={href}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
