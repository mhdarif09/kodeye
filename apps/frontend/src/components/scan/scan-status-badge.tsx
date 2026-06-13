import { Badge } from '../ui/badge';
import type { ScanStatus } from '../../features/scans/types';

export function ScanStatusBadge({ status }: { status: ScanStatus }) {
  const tone =
    status === 'SUCCESS'
      ? 'success'
      : status === 'FAILED'
        ? 'danger'
        : status === 'RUNNING'
          ? 'primary'
          : status === 'PENDING'
            ? 'warning'
            : 'neutral';
  return <Badge tone={tone}>{status}</Badge>;
}
