import { FileWarning, Radar, ShieldCheck, TriangleAlert } from 'lucide-react';

import type { ReportData } from '../../features/reports/types';
import { Card } from '../ui/card';

export function ReportSummaryCards({ report }: { report: ReportData }) {
  const items = [
    {
      icon: FileWarning,
      label: 'Potential findings',
      value: report.summary.totalFindings,
    },
    {
      icon: TriangleAlert,
      label: 'Critical / High',
      value: report.summary.critical + report.summary.high,
    },
    {
      icon: Radar,
      label: 'Scanners observed',
      value: report.summary.scannerCount,
    },
    { icon: ShieldCheck, label: 'Risk level', value: report.summary.riskLevel },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ icon: Icon, label, value }) => (
        <Card className="p-4" key={label}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{label}</p>
            <Icon className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
        </Card>
      ))}
    </div>
  );
}
