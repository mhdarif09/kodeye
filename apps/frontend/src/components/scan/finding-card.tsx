import { FileCode2 } from 'lucide-react';

import type { Finding } from '../../features/scans/types';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { SeverityBadge } from './severity-badge';

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={finding.severity} />
        <Badge>{finding.scanner}</Badge>
        <Badge tone="primary">{finding.category}</Badge>
      </div>
      <h3 className="mt-4 font-bold text-slate-950">{finding.title}</h3>
      {finding.filePath ? (
        <p className="mt-2 flex items-center gap-2 truncate text-xs text-slate-500">
          <FileCode2 className="h-3.5 w-3.5 shrink-0" />
          {finding.filePath}
          {finding.lineStart ? `:${finding.lineStart}` : ''}
        </p>
      ) : null}
      {finding.evidenceMasked ? (
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-200">
          {finding.evidenceMasked}
        </pre>
      ) : null}
      {finding.recommendation ? (
        <div className="mt-4 rounded-xl bg-indigo-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
            Recommendation
          </p>
          <p className="mt-1 text-sm leading-6 text-indigo-950">
            {finding.recommendation}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
