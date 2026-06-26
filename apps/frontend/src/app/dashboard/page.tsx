'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../features/auth/use-auth';
import { Spinner } from '../../components/ui/spinner';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user?.role === 'ADMIN') {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/dashboard/settings');
      }
    }
  }, [isLoading, user?.role, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <Spinner />
    </div>
  );
}
