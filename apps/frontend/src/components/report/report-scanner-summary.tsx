import type { ReportData } from '../../features/reports/types';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export function ReportScannerSummary({ report }: { report: ReportData }) {
  return (
    <Card>
      <h2 className="font-bold text-slate-950">Scanner coverage</h2>
      <div className="mt-5 space-y-3">
        {report.scannerSummary.length ? (
          report.scannerSummary.map((scanner) => (
            <div
              className="rounded-xl border border-slate-200 p-4"
              key={scanner.scanner}
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="capitalize">{scanner.scanner}</strong>
                <Badge
                  tone={
                    scanner.status === 'failed'
                      ? 'danger'
                      : scanner.status === 'completed'
                        ? 'success'
                        : 'warning'
                  }
                >
                  {scanner.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{scanner.coverage}</p>
              <p className="mt-2 text-xs font-semibold text-indigo-600">
                {scanner.total} findings
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No scanner execution metadata is available.
          </p>
        )}
      </div>
    </Card>
  );
}
