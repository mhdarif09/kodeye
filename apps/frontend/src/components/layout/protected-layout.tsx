'use client';

import type { ReactNode } from 'react';

import { useAuth } from '../../features/auth/use-auth';
import { AppSidebar } from './app-sidebar';
import { AppTopbar } from './app-topbar';
import { GlobalLoadingScreen } from './global-loading-screen';
import { MobileNav } from './mobile-nav';

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isLoading, logout, user } = useAuth({ requireAuth: true });

  if (isLoading || !user) {
    return <GlobalLoadingScreen message="Securing your workspace..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <div className="lg:pl-64">
        <AppTopbar logout={logout} user={user} />
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
