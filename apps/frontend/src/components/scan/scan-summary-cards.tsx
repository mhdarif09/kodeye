import { AlertTriangle, Bug, ShieldAlert, ShieldCheck } from 'lucide-react';

import type { ScanJob } from '../../features/scans/types';
import { Card } from '../ui/card';

export function ScanSummaryCards({ scan }: { scan: ScanJob }) {
  const summaries = [
    { icon: Bug, label: 'Total findings', value: scan.totalFindings },
    { icon: ShieldAlert, label: 'Critical', value: scan.criticalCount },
    { icon: AlertTriangle, label: 'High', value: scan.highCount },
    {
      icon: ShieldCheck,
      label: 'Medium / Low',
      value: scan.mediumCount + scan.lowCount,
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {summaries.map(({ icon: Icon, label, value }) => (
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
