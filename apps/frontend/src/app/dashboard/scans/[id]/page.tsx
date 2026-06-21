'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { FindingAiModal } from '../../../../components/ai/finding-ai-modal';
import { CodeAuditWorkspace } from '../../../../components/scan/code-audit-workspace';
import { Alert } from '../../../../components/ui/alert';
import { Spinner } from '../../../../components/ui/spinner';
import { scansApi } from '../../../../features/scans/api';
import type {
  Finding,
  ScanJob,
  ScanLog,
} from '../../../../features/scans/types';
import { getErrorMessage } from '../../../../lib/utils';

export default function ScanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanJob | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-20 bg-[#07111f] lg:left-64">
      <Link
        className="absolute bottom-4 left-4 z-30 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-300 shadow-lg backdrop-blur hover:text-white"
        href="/dashboard/scans"
      >
        <ArrowLeft className="h-4 w-4" /> Scan history
      </Link>
      <CodeAuditWorkspace
        className="rounded-none border-0 shadow-none"
        findings={findings}
        logs={logs}
        onAskAi={setAiFinding}
        scan={scan}
      />
      <FindingAiModal
        finding={aiFinding}
        onClose={() => setAiFinding(null)}
        scan={scan}
      />
    </div>
  );
}
