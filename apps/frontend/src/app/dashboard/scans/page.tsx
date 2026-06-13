'use client';

import { ExternalLink, Filter, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { EmptyState } from '../../../components/empty-state';
import { ScanStatusBadge } from '../../../components/scan/scan-status-badge';
import { Alert } from '../../../components/ui/alert';
import { Card } from '../../../components/ui/card';
import { Select } from '../../../components/ui/select';
import { Spinner } from '../../../components/ui/spinner';
import { scansApi } from '../../../features/scans/api';
import type { ScanJob, ScanStatus } from '../../../features/scans/types';
import { formatDate, getErrorMessage } from '../../../lib/utils';

export default function ScansPage() {
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [status, setStatus] = useState<ScanStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadScans = useCallback(async () => {
    try {
      setScans(await scansApi.listScans(status ? { status } : {}));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadScans();
  }, [loadScans]);

  return (
    <div>
      <p className="text-sm font-semibold text-brand-600">Scan history</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Repository security scans
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Track manual and GitHub-triggered scan jobs.
          </p>
        </div>
        <div className="w-full sm:w-52">
          <Select
            id="scan-status"
            label="Filter status"
            onChange={(event) =>
              setStatus(event.target.value as ScanStatus | '')
            }
            value={status}
          >
            <option value="">All statuses</option>
            {['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED'].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </Select>
        </div>
      </div>
      {error ? (
        <Alert className="mt-5" tone="error">
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
          <Spinner /> Loading scan history...
        </div>
      ) : scans.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            description="No scans yet. Start a scan from your repositories page."
            icon={ShieldCheck}
            title="No scans yet"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {scans.map((scan) => (
            <Card
              className="transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              key={scan.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <ScanStatusBadge status={scan.status} />
                    <span className="text-xs text-slate-400">
                      {triggerLabel(scan.triggerType)}
                    </span>
                    {scan.pullRequestNumber ? (
                      <span className="text-xs font-semibold text-indigo-600">
                        PR #{scan.pullRequestNumber}
                      </span>
                    ) : null}
                  </div>
                  <Link href={`/dashboard/scans/${scan.id}`}>
                    <h2 className="mt-3 truncate font-bold text-slate-950 hover:text-indigo-700">
                      {scan.repository.fullName ?? scan.repository.name}
                    </h2>
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {scan.branch ?? scan.repository.defaultBranch} |{' '}
                    {formatDate(scan.createdAt)}
                    {scan.commitSha ? ` | ${scan.commitSha.slice(0, 7)}` : ''}
                  </p>
                  {scan.githubCheckUrl ? (
                    <a
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      href={scan.githubCheckUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View GitHub Check <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
                <div className="grid grid-cols-3 gap-5 text-center lg:text-right">
                  <Count label="Findings" value={scan.totalFindings} />
                  <Count
                    className="text-red-600"
                    label="Critical"
                    value={scan.criticalCount}
                  />
                  <Count
                    className="text-orange-600"
                    label="High"
                    value={scan.highCount}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
        <Filter className="h-3.5 w-3.5" /> Results are limited to organizations
        you can access.
      </div>
    </div>
  );
}

function Count({
  className = '',
  label,
  value,
}: {
  className?: string;
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className={`text-lg font-bold ${className}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function triggerLabel(trigger: ScanJob['triggerType']) {
  if (trigger === 'GITHUB_SYNC') return 'GitHub Initial Audit';
  if (trigger === 'GITHUB_PUSH') return 'GitHub Push';
  if (trigger === 'GITHUB_PULL_REQUEST') return 'GitHub Pull Request';
  return 'Manual';
}
