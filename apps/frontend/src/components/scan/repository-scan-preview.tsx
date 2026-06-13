'use client';

import { CheckCircle2, FileCode2, FolderSearch, Loader2 } from 'lucide-react';

import type { ScanStatus } from '../../features/scans/types';
import { Card } from '../ui/card';

const targets = [
  'src/',
  'config/',
  'package.json',
  'package-lock.json',
  'Dockerfile',
  'docker-compose.yml',
  '.github/workflows/',
  '.env.example',
  'README.md',
];

export function RepositoryScanPreview({ status }: { status: ScanStatus }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <FolderSearch className="h-5 w-5 text-indigo-600" />
        <h2 className="font-bold text-slate-950">Common audit targets</h2>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {targets.map((target, index) => {
          const running = status === 'RUNNING' && index === 2;
          const checked = status === 'SUCCESS';
          const Icon = running ? Loader2 : checked ? CheckCircle2 : FileCode2;
          return (
            <div
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
              key={target}
            >
              <Icon
                className={`h-4 w-4 ${running ? 'animate-spin text-indigo-600' : checked ? 'text-emerald-600' : 'text-slate-400'}`}
              />
              <span className="truncate font-mono text-xs">{target}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Preview of common audit targets. Actual scanned files depend on
        repository contents.
      </p>
    </Card>
  );
}
