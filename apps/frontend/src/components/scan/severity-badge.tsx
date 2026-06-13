import type { FindingSeverity } from '../../features/scans/types';
import { cn } from '../../lib/utils';

const styles: Record<FindingSeverity, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-blue-100 text-blue-700',
  INFO: 'bg-slate-100 text-slate-700',
  UNKNOWN: 'bg-gray-100 text-gray-700',
};

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
        styles[severity],
      )}
    >
      {severity}
    </span>
  );
}
