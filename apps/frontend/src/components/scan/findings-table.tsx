import type { Finding } from '../../features/scans/types';
import { FindingCard } from './finding-card';
import { SeverityBadge } from './severity-badge';

export function FindingsTable({ findings }: { findings: Finding[] }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {findings.map((finding) => (
          <FindingCard finding={finding} key={finding.id} />
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Finding</th>
              <th className="px-4 py-3">Scanner</th>
              <th className="px-4 py-3">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {findings.map((finding) => (
              <tr key={finding.id}>
                <td className="px-4 py-4">
                  <SeverityBadge severity={finding.severity} />
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">
                    {finding.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {finding.category}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">{finding.scanner}</td>
                <td className="max-w-xs truncate px-4 py-4 text-slate-500">
                  {finding.filePath ?? 'Not provided'}
                  {finding.lineStart ? `:${finding.lineStart}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
