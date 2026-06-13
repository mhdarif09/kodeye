'use client';

import { Bot, Loader2, Radar, ShieldCheck, TriangleAlert } from 'lucide-react';

import type { ScanStatus } from '../../features/scans/types';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

export function ScanActivityVisual({ status }: { status: ScanStatus }) {
  const active = status === 'RUNNING' || status === 'PENDING';
  const Icon =
    status === 'SUCCESS'
      ? ShieldCheck
      : status === 'FAILED'
        ? TriangleAlert
        : Bot;
  const label =
    status === 'RUNNING'
      ? 'Analyzing enabled security signals'
      : status === 'PENDING'
        ? 'Waiting for scanner worker'
        : status === 'SUCCESS'
          ? 'Scan processing completed'
          : status === 'FAILED'
            ? 'Scan processing stopped'
            : 'Scan canceled';

  return (
    <Card className="relative min-h-72 overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.25),transparent_58%)]" />
      {active ? (
        <div className="absolute inset-x-6 top-1/2 h-px animate-pulse bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
      ) : null}
      <div className="relative flex min-h-60 flex-col items-center justify-center text-center">
        <div
          className={cn(
            'relative flex h-24 w-24 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/10',
            active && 'animate-pulse',
          )}
        >
          <Radar className="absolute h-20 w-20 text-cyan-300/30" />
          <Icon className="h-10 w-10 text-cyan-300" />
        </div>
        <p className="mt-6 font-semibold">{label}</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
          Visual activity reflects job status. Findings are only shown when
          saved by enabled scanners.
        </p>
        {active ? (
          <span className="mt-4 inline-flex items-center gap-2 text-xs text-cyan-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Status monitoring
            active
          </span>
        ) : null}
      </div>
    </Card>
  );
}
