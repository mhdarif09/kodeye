'use client';

import { ArrowLeft, ExternalLink, FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FindingsTable } from '../../../../components/scan/findings-table';
import { FindingAiModal } from '../../../../components/ai/finding-ai-modal';
import { CodeAuditWorkspace } from '../../../../components/scan/code-audit-workspace';
import { ScanLogs } from '../../../../components/scan/scan-logs';
import { ScanStatusBadge } from '../../../../components/scan/scan-status-badge';
import { ScanSummaryCards } from '../../../../components/scan/scan-summary-cards';
import { ReportActions } from '../../../../components/report/report-actions';
import { Alert } from '../../../../components/ui/alert';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Spinner } from '../../../../components/ui/spinner';
import { scansApi } from '../../../../features/scans/api';
import type {
  Finding,
  FindingSeverity,
  ScanJob,
  ScanLog,
} from '../../../../features/scans/types';
import { formatDate, getErrorMessage } from '../../../../lib/utils';

const statusCopy: Record<ScanJob['status'], string> = {
  CANCELED: 'Scan was canceled before completion.',
  FAILED: 'Scan failed. Review the scan logs to understand what happened.',
  PENDING: 'Scan job has been created and is waiting for the scanner worker.',
  RUNNING:
    'Kodeye is analyzing your repository for risky code patterns, leaked secrets, and dependency issues.',
  SUCCESS: 'Scan completed. Review the findings and recommendations below.',
};

export default function ScanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanJob | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [findingSearch, setFindingSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<FindingSeverity | 'ALL'>(
    'ALL',
  );
  const [aiFinding, setAiFinding] = useState<Finding | null>(null);

  const load = useCallback(async () => {
    try {
      const [scanResult, findingResult, logResult] = await Promise.all([
        scansApi.getScan(id),
        scansApi.getScanFindings(id),
        scansApi.getScanLogs(id),
      ]);
      setScan(scanResult);
      setFindings(findingResult);
      setLogs(logResult);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!scan || !['PENDING', 'RUNNING'].includes(scan.status)) return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [load, scan]);

  const filteredFindings = useMemo(() => {
    const search = findingSearch.trim().toLowerCase();
    return findings.filter((finding) => {
      if (severityFilter !== 'ALL' && finding.severity !== severityFilter) {
        return false;
      }
      if (!search) return true;
      return [
        finding.title,
        finding.category,
        finding.cwe,
        finding.owasp,
        finding.description,
      ].some((value) => value?.toLowerCase().includes(search));
    });
  }, [findingSearch, findings, severityFilter]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Spinner /> Loading scan detail...
      </div>
    );
  }
  if (error || !scan) {
    return <Alert tone="error">{error || 'Scan job not found.'}</Alert>;
  }

  const active = scan.status === 'PENDING' || scan.status === 'RUNNING';

  return (
    <div>
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"
        href="/dashboard/scans"
      >
        <ArrowLeft className="h-4 w-4" /> Scan history
      </Link>

      <Card className="mt-5 overflow-hidden bg-gradient-to-br from-white to-indigo-50/70">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <ScanStatusBadge status={scan.status} />
            <h1 className="mt-4 truncate text-3xl font-bold tracking-tight text-slate-950">
              {scan.repository.fullName ?? scan.repository.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {statusCopy[scan.status]}
            </p>
          </div>
          <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-400">Branch</dt>
              <dd className="mt-1 font-semibold">{scan.branch ?? 'Default'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Trigger</dt>
              <dd className="mt-1 font-semibold">
                {scan.triggerType.replaceAll('_', ' ')}
              </dd>
            </div>
            {scan.commitSha ? (
              <div>
                <dt className="text-slate-400">Commit</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {scan.commitSha.slice(0, 7)}
                </dd>
              </div>
            ) : null}
            {scan.pullRequestNumber ? (
              <div>
                <dt className="text-slate-400">Pull request</dt>
                <dd className="mt-1 font-semibold">
                  PR #{scan.pullRequestNumber}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-slate-400">Created</dt>
              <dd className="mt-1 font-semibold">
                {formatDate(scan.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Finished</dt>
              <dd className="mt-1 font-semibold">
                {scan.finishedAt ? formatDate(scan.finishedAt) : 'Not yet'}
              </dd>
            </div>
          </dl>
        </div>
        {scan.githubCheckUrl ? (
          <a
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            href={scan.githubCheckUrl}
            rel="noreferrer"
            target="_blank"
          >
            View GitHub Check <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </Card>

      {scan.status === 'PENDING' ? (
        <Alert className="mt-5">
          This job is waiting for an enabled scanner worker. In standard local
          development, scanner execution is disabled until the Dockerized worker
          is started.
        </Alert>
      ) : null}
      {scan.errorMessage ? (
        <Alert className="mt-5" tone="error">
          {scan.errorMessage}
        </Alert>
      ) : null}
      {active ? (
        <p className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Auto-refreshing
          scan status...
        </p>
      ) : null}

      <div className="mt-6">
        <ScanSummaryCards scan={scan} />
      </div>
      <div className="mt-6">
        <CodeAuditWorkspace
          findings={findings}
          logs={logs}
          onAskAi={setAiFinding}
          scan={scan}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-950">Findings</h2>
        <p className="mt-2 text-sm text-slate-500">
          Potential issues detected by enabled scanners. Evidence is masked
          where it may contain a secret.
        </p>
        {findings.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
            <Input
              id="finding-search"
              label="Search findings"
              onChange={(event) => setFindingSearch(event.target.value)}
              placeholder="Search name, category, CWE, or OWASP"
              value={findingSearch}
            />
            <Select
              id="finding-severity"
              label="Severity"
              onChange={(event) =>
                setSeverityFilter(event.target.value as FindingSeverity | 'ALL')
              }
              value={severityFilter}
            >
              <option value="ALL">All severities</option>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'UNKNOWN'].map(
                (severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ),
              )}
            </Select>
          </div>
        ) : null}
        <div className="mt-5">
          {filteredFindings.length > 0 ? (
            <FindingsTable findings={filteredFindings} onAskAi={setAiFinding} />
          ) : findings.length > 0 ? (
            <Card className="text-sm text-slate-500">
              No findings match the current search and severity filter.
            </Card>
          ) : scan.status === 'SUCCESS' ? (
            <Alert tone="success">
              <p className="font-semibold">
                No findings detected by enabled scanners.
              </p>
              <p className="mt-1">
                This does not guarantee the codebase is vulnerability-free.
              </p>
            </Alert>
          ) : (
            <Card className="text-sm text-slate-500">
              No findings have been saved for this scan.
            </Card>
          )}
        </div>
      </section>
      <FindingAiModal
        finding={aiFinding}
        onClose={() => setAiFinding(null)}
        scan={scan}
      />
      <div className="mt-6">
        <ScanLogs logs={logs} />
      </div>
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-950">Reports</h2>
            <p className="mt-1 text-sm text-slate-500">
              Export a professional summary with masked evidence and objective
              findings.
            </p>
          </div>
        </div>
        <Card className="mt-4">
          {active ? (
            <Alert>Report will be available after the scan is completed.</Alert>
          ) : (
            <div className="space-y-4">
              {scan.status === 'FAILED' ? (
                <Alert tone="error">
                  The report may be incomplete because this scan failed.
                </Alert>
              ) : null}
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                href={`/dashboard/scans/${id}/report`}
              >
                View Report
              </Link>
              <ReportActions scanId={id} />
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
