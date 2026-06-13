'use client';

import { useState } from 'react';

import type { ScanLog } from '../../features/scans/types';
import { formatDate } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function ScanLogs({ logs }: { logs: ScanLog[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-950">Scan logs</h2>
          <p className="mt-1 text-sm text-slate-500">
            {logs.length} lifecycle events recorded
          </p>
        </div>
        <Button onClick={() => setOpen((value) => !value)} variant="secondary">
          {open ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      {open ? (
        <div className="mt-5 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">No scan logs yet.</p>
          ) : (
            logs.map((log) => (
              <div
                className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center"
                key={log.id}
              >
                <Badge tone={log.level === 'error' ? 'danger' : 'neutral'}>
                  {log.level}
                </Badge>
                <p className="flex-1 text-sm text-slate-700">{log.message}</p>
                <time className="text-xs text-slate-400">
                  {formatDate(log.createdAt)}
                </time>
              </div>
            ))
          )}
        </div>
      ) : null}
    </Card>
  );
}
