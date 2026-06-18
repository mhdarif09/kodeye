'use client';

import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Circle,
  FileCode2,
  Folder,
  GitBranch,
  Loader2,
  SearchCode,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Finding, ScanJob, ScanLog } from '../../features/scans/types';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';
import { SeverityBadge } from './severity-badge';

interface AuditFile {
  findings: Finding[];
  path: string;
}

const fallbackFiles = [
  'src/',
  'app/',
  'config/',
  'package.json',
  'Dockerfile',
  'docker-compose.yml',
  '.github/workflows/',
  '.env.example',
];

const scannerSteps = [
  {
    key: 'clone',
    label: 'Clone repo',
    match: [
      'clone completed',
      'cloning repository',
      'cloning public repository',
    ],
  },
  {
    key: 'inventory',
    label: 'Map folders',
    match: ['full working-tree audit scope', 'top audited folders'],
  },
  { key: 'semgrep', label: 'SAST', match: ['semgrep'] },
  { key: 'gitleaks', label: 'Secrets', match: ['gitleaks'] },
  { key: 'trivy', label: 'Dependencies', match: ['trivy'] },
  {
    key: 'normalize',
    label: 'Normalize',
    match: ['normalizing findings', 'saving findings', 'findings saved'],
  },
] as const;

export function CodeAuditWorkspace({
  findings,
  logs,
  scan,
  onAskAi,
}: {
  findings: Finding[];
  logs: ScanLog[];
  scan: ScanJob;
  onAskAi: (finding: Finding) => void;
}) {
  const files = useMemo(() => groupFindingsByFile(findings), [findings]);
  const displayFiles = files.length
    ? files
    : fallbackFiles.map((path) => ({ findings: [], path }));
  const [selectedPath, setSelectedPath] = useState(displayFiles[0]?.path ?? '');
  const selected =
    displayFiles.find((file) => file.path === selectedPath) ?? displayFiles[0];
  const selectedFinding = selected?.findings[0];
  const progress = scannerProgress(logs, scan.status);

  return (
    <Card className="overflow-hidden bg-slate-950 p-0 text-slate-100">
      <div className="flex flex-col border-b border-slate-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <SearchCode className="h-4 w-4" /> Code audit workspace
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">
            Full repository scanner
          </h2>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400 lg:mt-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1">
            <GitBranch className="h-3.5 w-3.5" />
            {scan.branch ?? scan.repository.defaultBranch}
          </span>
          <span className="rounded-full bg-slate-900 px-3 py-1">
            {progress.percent}% scanned
          </span>
        </div>
      </div>

      <div className="grid min-h-[520px] lg:grid-cols-[260px_1fr_300px]">
        <aside className="border-b border-slate-800 bg-slate-900/70 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Explorer
          </div>
          <div className="max-h-[480px] space-y-1 overflow-auto p-3">
            {displayFiles.map((file) => (
              <button
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
                  selected?.path === file.path
                    ? 'bg-indigo-500/20 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                )}
                key={file.path}
                onClick={() => setSelectedPath(file.path)}
                type="button"
              >
                {file.path.endsWith('/') ? (
                  <Folder className="h-4 w-4 shrink-0 text-cyan-300" />
                ) : (
                  <FileCode2
                    className={cn(
                      'h-4 w-4 shrink-0',
                      selected?.path === file.path
                        ? 'text-cyan-200'
                        : 'text-slate-500',
                    )}
                  />
                )}
                <span className="truncate font-mono text-xs">{file.path}</span>
                {file.findings.length ? (
                  <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-200">
                    {file.findings.length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 border-b border-slate-800 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-3 truncate font-mono text-xs text-slate-400">
              {selected?.path ?? 'repository'}
            </span>
          </div>
          <div className="max-h-[520px] overflow-auto p-5">
            {selectedFinding ? (
              <FindingEditorView finding={selectedFinding} onAskAi={onAskAi} />
            ) : (
              <EmptyEditorView scan={scan} />
            )}
          </div>
        </main>

        <aside className="bg-slate-900/60">
          <div className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Scanner progress
          </div>
          <div className="space-y-4 p-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {scannerSteps.map((step) => {
              const state = progress.states[step.key];
              const Icon =
                state === 'done'
                  ? CheckCircle2
                  : state === 'running'
                    ? Loader2
                    : state === 'failed'
                      ? AlertTriangle
                      : Circle;
              return (
                <div className="flex items-center gap-3" key={step.key}>
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      state === 'done' && 'text-emerald-400',
                      state === 'running' && 'animate-spin text-cyan-300',
                      state === 'failed' && 'text-red-400',
                      state === 'waiting' && 'text-slate-600',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        state === 'waiting' ? 'text-slate-500' : 'text-white',
                      )}
                    >
                      {step.label}
                    </p>
                    <p
                      className={cn(
                        'truncate text-xs',
                        state === 'waiting' ? 'text-slate-500' : 'text-slate-300',
                      )}
                    >
                      {latestMatchingLog(logs, step.match) ?? 'Waiting'}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-400">
              Source code is scanned in the temporary worker workspace. This UI
              shows masked evidence and finding context, not a persisted copy of
              the repository.
            </div>
          </div>
        </aside>
      </div>
    </Card>
  );
}

function FindingEditorView({
  finding,
  onAskAi,
}: {
  finding: Finding;
  onAskAi: (finding: Finding) => void;
}) {
  const lines = editorLines(finding);
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
              {finding.scanner}
            </span>
            {finding.cwe ? (
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {finding.cwe}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-lg font-bold text-white">{finding.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            {finding.description ?? 'No scanner description provided.'}
          </p>
        </div>
        <button
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          onClick={() => onAskAi(finding)}
          type="button"
        >
          <Bot className="h-4 w-4" /> Ask AI
        </button>
      </div>
      <pre className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-0 text-xs leading-6 text-slate-300">
        {lines.map((line, index) => (
          <div
            className={cn(
              'grid grid-cols-[56px_1fr] px-3',
              line.highlight && 'bg-red-500/10 text-red-100',
            )}
            key={`${line.number}-${index}`}
          >
            <span className="select-none pr-4 text-right text-slate-600">
              {line.number}
            </span>
            <code className="whitespace-pre-wrap font-mono">{line.text}</code>
          </div>
        ))}
      </pre>
      {finding.recommendation ? (
        <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm leading-6 text-indigo-100">
          <p className="font-semibold">Recommended fix</p>
          <p className="mt-1 text-indigo-100/80">{finding.recommendation}</p>
        </div>
      ) : null}
    </div>
  );
}

function EmptyEditorView({ scan }: { scan: ScanJob }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
      <SearchCode className="h-12 w-12 text-cyan-300" />
      <h3 className="mt-4 text-lg font-bold text-white">
        Auditing repository folders
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        Kodeye is scanning {scan.repository.fullName ?? scan.repository.name}{' '}
        from the repository root. Findings will appear here as masked,
        reviewable code context after scanners save results.
      </p>
    </div>
  );
}

function groupFindingsByFile(findings: Finding[]): AuditFile[] {
  const grouped = new Map<string, Finding[]>();
  for (const finding of findings) {
    const path = finding.filePath ?? 'repository';
    grouped.set(path, [...(grouped.get(path) ?? []), finding]);
  }
  return [...grouped.entries()]
    .map(([path, groupedFindings]) => ({ findings: groupedFindings, path }))
    .sort((left, right) => right.findings.length - left.findings.length);
}

function scannerProgress(logs: ScanLog[], status: ScanJob['status']) {
  const states = Object.fromEntries(
    scannerSteps.map((step) => [step.key, 'waiting']),
  ) as Record<(typeof scannerSteps)[number]['key'], string>;
  let completed = 0;

  scannerSteps.forEach((step, index) => {
    const matched = logs.some((log) =>
      step.match.some((pattern) => log.message.toLowerCase().includes(pattern)),
    );
    if (matched || status === 'SUCCESS') {
      states[step.key] = 'done';
      completed = Math.max(completed, index + 1);
    }
  });

  if (status === 'FAILED') {
    const failedIndex = Math.max(0, completed - 1);
    const failedStep = scannerSteps[failedIndex] ?? scannerSteps[0];
    states[failedStep.key] = 'failed';
  } else if (status === 'RUNNING' || status === 'PENDING') {
    const runningIndex = Math.min(completed, scannerSteps.length - 1);
    const runningStep = scannerSteps[runningIndex] ?? scannerSteps[0];
    states[runningStep.key] = 'running';
  }

  return {
    percent:
      status === 'SUCCESS'
        ? 100
        : Math.round((completed / scannerSteps.length) * 100),
    states,
  };
}

function latestMatchingLog(logs: ScanLog[], patterns: readonly string[]) {
  return [...logs]
    .reverse()
    .find((log) =>
      patterns.some((pattern) => log.message.toLowerCase().includes(pattern)),
    )?.message;
}

function editorLines(finding: Finding) {
  const start = finding.lineStart ?? 1;
  const evidence = finding.evidenceMasked?.trim();
  const body = evidence
    ? evidence.split(/\r?\n/)
    : [
        `// ${finding.title}`,
        `// Scanner: ${finding.scanner}`,
        `// Category: ${finding.category}`,
        `// CWE: ${finding.cwe ?? 'not provided'}`,
        `// OWASP: ${finding.owasp ?? 'not provided'}`,
      ];
  return body.slice(0, 80).map((text, index) => ({
    highlight: Boolean(evidence) || index === 0,
    number: start + index,
    text,
  }));
}
