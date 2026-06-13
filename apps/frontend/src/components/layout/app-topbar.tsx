'use client';

import { LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import type { User } from '../../features/auth/types';
import { Button } from '../ui/button';

export function AppTopbar({
  logout,
  user,
}: {
  logout: () => void;
  user: User;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-2 font-bold text-slate-950 lg:hidden"
          href="/dashboard"
        >
          <ShieldCheck className="h-6 w-6 text-brand-600" />
          Kodeye
        </Link>
        <div className="ml-auto flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <Button className="px-3" onClick={logout} variant="ghost">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
