'use client';

import { Download, ExternalLink, FileJson } from 'lucide-react';
import { useState } from 'react';

import { reportsApi, type ReportFormat } from '../../features/reports/api';
import { getErrorMessage } from '../../lib/utils';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';

export function ReportActions({ scanId }: { scanId: string }) {
  const [loading, setLoading] = useState<ReportFormat | ''>('');
  const [error, setError] = useState('');

  async function handle(format: ReportFormat) {
    setError('');
    setLoading(format);
    try {
      const blob = await reportsApi.download(scanId, format);
      const url = URL.createObjectURL(blob);
      if (format === 'html') {
        window.open(url, '_blank', 'noopener,noreferrer');
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `kodeye-report-${scanId}.${format}`;
        anchor.click();
        URL.revokeObjectURL(url);
      }
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading('');
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          disabled={Boolean(loading)}
          onClick={() => handle('html')}
          variant="secondary"
        >
          <ExternalLink className="h-4 w-4" />{' '}
          {loading === 'html' ? 'Opening...' : 'View HTML Report'}
        </Button>
        <Button disabled={Boolean(loading)} onClick={() => handle('pdf')}>
          <Download className="h-4 w-4" />{' '}
          {loading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
        </Button>
        <Button
          disabled={Boolean(loading)}
          onClick={() => handle('json')}
          variant="secondary"
        >
          <FileJson className="h-4 w-4" />{' '}
          {loading === 'json' ? 'Preparing JSON...' : 'Download JSON'}
        </Button>
      </div>
      {error ? (
        <Alert className="mt-3" tone="error">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
