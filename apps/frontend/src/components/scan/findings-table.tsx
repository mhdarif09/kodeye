import type { Finding } from '../../features/scans/types';
import { Button } from '../ui/button';
import { FindingCard } from './finding-card';
import { SeverityBadge } from './severity-badge';

export function FindingsTable({
  findings,
  onAskAi,
}: {
  findings: Finding[];
  onAskAi?: (finding: Finding) => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {findings.map((finding) => (
          <div className="space-y-2" key={finding.id}>
            <FindingCard finding={finding} />
            {onAskAi ? (
              <Button
                className="w-full"
                onClick={() => onAskAi(finding)}
                variant="secondary"
              >
                Ask AI
              </Button>
            ) : null}
          </div>
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
              {onAskAi ? <th className="px-4 py-3">AI Review</th> : null}
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
                {onAskAi ? (
                  <td className="px-4 py-4">
                    <Button
                      onClick={() => onAskAi(finding)}
                      variant="secondary"
                    >
                      Ask AI
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
