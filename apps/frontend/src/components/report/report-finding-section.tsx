import type { FindingSeverity } from '../../features/scans/types';
import type { ReportData } from '../../features/reports/types';
import { FindingCard } from '../scan/finding-card';
import { Card } from '../ui/card';

const order: FindingSeverity[] = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'INFO',
  'UNKNOWN',
];

export function ReportFindingSection({ report }: { report: ReportData }) {
  if (!report.findings.length) {
    return (
      <Card>
        <h2 className="font-bold text-slate-950">
          No findings detected by enabled scanners.
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          This does not guarantee the codebase is vulnerability-free. Manual
          verification is recommended.
        </p>
      </Card>
    );
  }
  return (
    <div className="space-y-8">
      {order.map((severity) => {
        const findings = report.findingsBySeverity[severity] ?? [];
        if (!findings.length) return null;
        return (
          <section key={severity}>
            <h2 className="text-lg font-bold text-slate-950">
              {severity} findings
            </h2>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {findings.map((finding) => (
                <FindingCard finding={finding} key={finding.id} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
