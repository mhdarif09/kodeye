'use client';

import { Building2, Radar, SquareCode } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Alert } from '../../components/ui/alert';
import { Card } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';
import { organizationsApi } from '../../features/organizations/api';
import { repositoriesApi } from '../../features/repositories/api';
import { getErrorMessage } from '../../lib/utils';

export default function DashboardPage() {
  const [counts, setCounts] = useState({ organizations: 0, repositories: 0 });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([organizationsApi.list(), repositoriesApi.list()])
      .then(([organizations, repositories]) =>
        setCounts({
          organizations: organizations.length,
          repositories: repositories.length,
        }),
      )
      .catch((caughtError) => setError(getErrorMessage(caughtError)))
      .finally(() => setIsLoading(false));
  }, []);

  const cards = [
    {
      href: '/dashboard/organizations',
      icon: Building2,
      label: 'Organizations',
      value: counts.organizations,
      detail: 'Workspaces you can access',
    },
    {
      href: '/dashboard/repositories',
      icon: SquareCode,
      label: 'Repositories',
      value: counts.repositories,
      detail: 'Manual repository records',
    },
    {
      icon: Radar,
      label: 'Security Scans',
      value: 'Soon',
      detail: 'Automated scanning arrives next phase',
    },
  ];

  return (
    <div>
      <p className="text-sm font-semibold text-brand-600">Overview</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        Welcome to your security workspace
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
        Start by creating an organization and adding a repository manually.
        GitHub integration and automated scanning will be added in the next
        phase.
      </p>
      {error ? (
        <Alert className="mt-6" tone="error">
          {error}
        </Alert>
      ) : null}
      {isLoading ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
          <Spinner /> Loading workspace...
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map(({ detail, href, icon: Icon, label, value }) => {
            const content = (
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold text-slate-950">
                    {value}
                  </span>
                </div>
                <h2 className="mt-6 font-bold text-slate-950">{label}</h2>
                <p className="mt-1 text-sm text-slate-500">{detail}</p>
              </Card>
            );
            return href ? (
              <Link href={href} key={label}>
                {content}
              </Link>
            ) : (
              <div key={label}>{content}</div>
            );
          })}
        </div>
      )}
      <Card className="mt-8 border-brand-100 bg-gradient-to-r from-brand-50 to-cyan-50">
        <h2 className="font-bold text-slate-950">A good first step</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Review your default organization, then add the repository you want to
          audit later.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            href="/dashboard/organizations"
          >
            View organizations
          </Link>
          <Link
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href="/dashboard/repositories"
          >
            Add repository
          </Link>
        </div>
      </Card>
    </div>
  );
}
