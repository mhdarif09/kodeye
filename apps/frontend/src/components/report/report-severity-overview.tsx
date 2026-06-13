import type { ReportData } from '../../features/reports/types';
import { Card } from '../ui/card';

export function ReportSeverityOverview({ report }: { report: ReportData }) {
  const items = [
    ['Critical', report.summary.critical, 'bg-red-500'],
    ['High', report.summary.high, 'bg-orange-500'],
    ['Medium', report.summary.medium, 'bg-amber-500'],
    ['Low', report.summary.low, 'bg-blue-500'],
    ['Info', report.summary.info, 'bg-slate-400'],
  ] as const;
  const maximum = Math.max(...items.map((item) => item[1]), 1);
  return (
    <Card>
      <h2 className="font-bold text-slate-950">Severity overview</h2>
      <div className="mt-5 space-y-4">
        {items.map(([label, value, color]) => (
          <div key={label}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{label}</span>
              <strong>{value}</strong>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${color}`}
                style={{
                  width: `${Math.max((value / maximum) * 100, value ? 5 : 0)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
