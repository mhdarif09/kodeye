'use client';

import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ReportActions } from '../../../../../components/report/report-actions';
import { ReportDisclaimer } from '../../../../../components/report/report-disclaimer';
import { ReportFindingSection } from '../../../../../components/report/report-finding-section';
import { ReportScannerSummary } from '../../../../../components/report/report-scanner-summary';
import { ReportSeverityOverview } from '../../../../../components/report/report-severity-overview';
import { ReportSummaryCards } from '../../../../../components/report/report-summary-cards';
import { Alert } from '../../../../../components/ui/alert';
import { Card } from '../../../../../components/ui/card';
import { Spinner } from '../../../../../components/ui/spinner';
import { reportsApi } from '../../../../../features/reports/api';
import type { ReportData } from '../../../../../features/reports/types';
import { formatDate, getErrorMessage } from '../../../../../lib/utils';

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void reportsApi
      .get(id)
      .then(setReport)
      .catch((caughtError: unknown) => {
        setError(getErrorMessage(caughtError));
      });
  }, [id]);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!report) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Spinner /> Loading security report...
      </div>
    );
  }

  return (
    <div>
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"
        href={`/dashboard/scans/${id}`}
      >
        <ArrowLeft className="h-4 w-4" /> Scan detail
      </Link>
      <Card className="mt-5 overflow-hidden bg-gradient-to-br from-white to-indigo-50/70">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Kodeye Security Audit Report
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {report.repository.fullName ?? report.repository.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {report.summary.executiveSummary}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs text-slate-400">Risk level</p>
            <p className="mt-1 text-2xl font-bold">
              {report.summary.riskLevel}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Scan status" value={report.metadata.scanStatus} />
          <Meta
            label="Branch"
            value={report.metadata.branch ?? report.repository.defaultBranch}
          />
          <Meta label="Organization" value={report.organization.name} />
          <Meta
            label="Generated"
            value={formatDate(report.metadata.generatedAt)}
          />
        </div>
        <div className="mt-6">
          <ReportActions scanId={id} />
        </div>
      </Card>
      {report.metadata.scanStatus === 'FAILED' ? (
        <Alert className="mt-5" tone="error">
          This scan did not complete successfully. Report findings and coverage
          may be incomplete.
        </Alert>
      ) : report.metadata.scanStatus === 'PENDING' ||
        report.metadata.scanStatus === 'RUNNING' ? (
        <Alert className="mt-5">
          The scan is not completed yet. Report data may be incomplete.
        </Alert>
      ) : null}
      <div className="mt-6">
        <ReportSummaryCards report={report} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ReportSeverityOverview report={report} />
        <ReportScannerSummary report={report} />
      </div>
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Potential findings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Prioritized technical details detected by enabled scanners.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <ReportFindingSection report={report} />
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-950">
          Recommended priorities
        </h2>
        <Card className="mt-4">
          {report.recommendations.length ? (
            <ol className="space-y-3 text-sm text-slate-700">
              {report.recommendations.map((recommendation, index) => (
                <li className="flex gap-3" key={recommendation}>
                  <span className="font-bold text-indigo-600">
                    {index + 1}.
                  </span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-500">
              Continue with manual security verification and review scanner
              coverage.
            </p>
          )}
        </Card>
      </section>
      <div className="mt-6">
        <ReportDisclaimer text={report.disclaimer} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  );
}
