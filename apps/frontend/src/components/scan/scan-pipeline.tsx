import { CheckCircle2, Circle, Loader2, TriangleAlert } from 'lucide-react';

import type { ScanLog, ScanStatus } from '../../features/scans/types';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

const steps = [
  'Queued',
  'Repository Access',
  'Clone Repository',
  'SAST Analysis',
  'Secret Scan',
  'Dependency Review',
  'Normalize Findings',
  'Completed',
];

export function ScanPipeline({
  logs,
  status,
}: {
  logs: ScanLog[];
  status: ScanStatus;
}) {
  const current = inferStep(logs, status);
  return (
    <Card>
      <h2 className="font-bold text-slate-950">Scan pipeline</h2>
      <div className="mt-5 space-y-1">
        {steps.map((step, index) => {
          const state =
            status === 'SUCCESS'
              ? 'success'
              : status === 'FAILED' && index === current
                ? 'failed'
                : index < current
                  ? 'success'
                  : index === current
                    ? 'running'
                    : 'waiting';
          const Icon =
            state === 'success'
              ? CheckCircle2
              : state === 'failed'
                ? TriangleAlert
                : state === 'running'
                  ? Loader2
                  : Circle;
          return (
            <div className="flex gap-3" key={step}>
              <div className="flex flex-col items-center">
                <Icon
                  className={cn(
                    'h-5 w-5',
                    state === 'running' && 'animate-spin text-indigo-600',
                    state === 'success' && 'text-emerald-600',
                    state === 'failed' && 'text-red-600',
                    state === 'waiting' && 'text-slate-300',
                  )}
                />
                {index < steps.length - 1 ? (
                  <span className="h-7 w-px bg-slate-200" />
                ) : null}
              </div>
              <p
                className={cn(
                  'pt-0.5 text-sm font-medium',
                  state === 'waiting' ? 'text-slate-400' : 'text-slate-800',
                )}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function inferStep(logs: ScanLog[], status: ScanStatus): number {
  if (status === 'PENDING') return 0;
  if (status === 'SUCCESS') return steps.length - 1;
  for (const log of [...logs].reverse()) {
    const message = log.message.toLowerCase();
    if (
      message.includes('normalize') ||
      message.includes('saving findings') ||
      message.includes('findings saved')
    )
      return 6;
    if (message.includes('trivy') || message.includes('dependency')) return 5;
    if (message.includes('gitleaks') || message.includes('secret')) return 4;
    if (message.includes('semgrep') || message.includes('sast')) return 3;
    if (message.includes('clone')) return 2;
    if (
      message.includes('github installation') ||
      message.includes('installation token')
    )
      return 1;
  }
  return 1;
}
