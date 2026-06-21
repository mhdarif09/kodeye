'use client';

import {
  AlertTriangle,
  Bot,
  Braces,
  Bug,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Circle,
  FileCode2,
  Files,
  Folder,
  GitBranch,
  GitCommit,
  Loader2,
  PanelBottom,
  PlayCircle,
  SearchCode,
  Send,
  ShieldAlert,
  Sparkles,
  TerminalSquare,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { aiApi } from '../../features/ai/api';
import type { AiSourceFile } from '../../features/ai/types';
import type { Finding, ScanJob, ScanLog } from '../../features/scans/types';
import { cn, getErrorMessage } from '../../lib/utils';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { SeverityBadge } from './severity-badge';

interface AuditFile {
  findings: Finding[];
  isFolder?: boolean;
  path: string;
}

interface AiChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

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
  {
    key: 'quality',
    label: 'Code quality',
    match: ['code-quality'],
  },
  { key: 'semgrep', label: 'SAST', match: ['semgrep'] },
  { key: 'codeql', label: 'CodeQL', match: ['codeql'] },
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
  const displayFiles = files.length ? files : foldersFromScanLogs(logs, scan);
  const [selectedPath, setSelectedPath] = useState(displayFiles[0]?.path ?? '');
  const [sourceFiles, setSourceFiles] = useState<Record<string, AiSourceFile>>(
    {},
  );
  const [selectedFindingId, setSelectedFindingId] = useState('');
  const [sourceLoadingId, setSourceLoadingId] = useState('');
  const [sourceError, setSourceError] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChat, setAiChat] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      text: 'Select a finding and ask me to explain the risk, suggest a patch, or review your draft code.',
    },
  ]);
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [aiChatError, setAiChatError] = useState('');
  const selected =
    displayFiles.find((file) => file.path === selectedPath) ?? displayFiles[0];
  const selectedFinding =
    selected?.findings.find((finding) => finding.id === selectedFindingId) ??
    selected?.findings[0];
  const progress = scannerProgress(logs, scan.status);
  const repositoryName = scan.repository.fullName ?? scan.repository.name;

  async function openSource(finding: Finding) {
    setSourceError('');
    if (sourceFiles[finding.id]) return;
    setSourceLoadingId(finding.id);
    try {
      const source = await aiApi.sourceFile(finding.id);
      setSourceFiles((current) => ({ ...current, [finding.id]: source }));
    } catch (caught) {
      setSourceError(getErrorMessage(caught));
    } finally {
      setSourceLoadingId('');
    }
  }

  async function askWorkspaceAi(prompt: string) {
    const question = prompt.trim();
    if (!selectedFinding || !question || aiChatLoading) return;
    setAiChatLoading(true);
    setAiChatError('');
    setAiChat((current) => [...current, { role: 'user', text: question }]);
    try {
      const review = await aiApi.reviewFinding(selectedFinding.id, question);
      setAiChat((current) => [
        ...current,
        {
          role: 'assistant',
          text: [
            review.explanation,
            `Risk: ${review.risk}`,
            `Fix: ${review.remediationSteps[0] ?? 'Review the highlighted code and apply the safest remediation.'}`,
          ].join('\n\n'),
        },
      ]);
      setAiQuestion('');
    } catch (caught) {
      setAiChatError(getErrorMessage(caught));
    } finally {
      setAiChatLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-slate-800 bg-[#07111f] p-0 text-slate-100 shadow-2xl shadow-slate-200">
      <div className="flex min-h-12 items-center justify-between border-b border-white/10 bg-[#0b1220] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="hidden h-5 w-px bg-white/10 sm:block" />
          <p className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-300">
            <SearchCode className="h-4 w-4 text-cyan-300" />
            <span className="truncate">Kodeye AI Remote Review</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {scan.status === 'PENDING' || scan.status === 'RUNNING' ? (
            <span className="hidden items-center gap-1 rounded-md bg-cyan-400/10 px-2.5 py-1 font-semibold text-cyan-200 sm:inline-flex">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              live scan
            </span>
          ) : null}
          <span className="hidden rounded-md bg-white/5 px-2.5 py-1 font-semibold text-slate-300 lg:inline">
            {repositoryName}
          </span>
          <span className="hidden items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 sm:inline-flex">
            <GitBranch className="h-3.5 w-3.5" />
            {scan.branch ?? scan.repository.defaultBranch}
          </span>
          {scan.commitSha ? (
            <span className="hidden items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 md:inline-flex">
              <GitCommit className="h-3.5 w-3.5" />
              {scan.commitSha.slice(0, 7)}
            </span>
          ) : null}
          <span className="rounded-md bg-cyan-400/10 px-2.5 py-1 font-semibold text-cyan-200">
            {progress.percent}%
          </span>
        </div>
      </div>

      <div className="grid min-h-[760px] xl:grid-cols-[48px_280px_minmax(560px,1fr)] 2xl:grid-cols-[48px_300px_minmax(640px,1fr)_360px]">
        <ActivityBar active={selectedFinding ? 'problems' : 'files'} />

        <aside className="border-b border-white/10 bg-[#0a1322] xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Explorer
            </p>
            <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-400">
              {displayFiles.length} files
            </span>
          </div>
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Workspace
            </p>
            <p className="truncate text-sm font-semibold text-slate-200">
              {repositoryName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {scan.status.toLowerCase()} | {findings.length} saved findings
            </p>
          </div>
          <div className="border-b border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
            Scan target
          </div>
          <div className="max-h-[360px] space-y-1 overflow-auto p-3 xl:max-h-[626px]">
            {displayFiles.map((file) => (
              <button
                className={cn(
                  'group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
                  selected?.path === file.path
                    ? 'bg-cyan-400/10 text-white ring-1 ring-cyan-400/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
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
                  <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-200 ring-1 ring-red-400/20">
                    {file.findings.length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col border-b border-white/10 bg-[#07111f] 2xl:border-b-0 2xl:border-r">
          <div className="flex min-h-11 items-end gap-1 border-b border-white/10 bg-[#0a1322] px-3">
            <div className="flex max-w-full items-center gap-2 rounded-t-lg border-x border-t border-white/10 bg-[#07111f] px-3 py-2">
              <FileCode2 className="h-4 w-4 shrink-0 text-cyan-300" />
              <span className="truncate font-mono text-xs text-slate-200">
                {selected?.path ?? 'scan.pipeline.ts'}
              </span>
              {selectedFinding ? (
                <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-200">
                  issue
                </span>
              ) : scan.status === 'RUNNING' || scan.status === 'PENDING' ? (
                <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-200">
                  live
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1 border-b border-white/10 px-4 py-2 text-xs text-slate-500">
            <span className="truncate">{repositoryName}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-mono text-slate-300">
              {selected?.path ?? 'scan.pipeline.ts'}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {selectedFinding ? (
              <FindingEditorView
                finding={selectedFinding}
                onAskAi={onAskAi}
                onOpenSource={openSource}
                source={sourceFiles[selectedFinding.id]}
                sourceError={sourceError}
                sourceLoading={sourceLoadingId === selectedFinding.id}
              />
            ) : (
              <EmptyEditorView
                file={selected}
                logs={logs}
                progress={progress.percent}
                scan={scan}
              />
            )}
          </div>
          <TerminalPanel logs={logs} scan={scan} />
        </main>

        <aside className="bg-[#0a1322] xl:col-span-3 2xl:col-span-1">
          <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Inspector
          </div>
          <div className="grid max-h-none gap-4 overflow-visible p-4 lg:grid-cols-2 xl:grid-cols-3 2xl:block 2xl:max-h-[708px] 2xl:space-y-5 2xl:overflow-auto">
            <AiScanCoach
              findings={findings}
              logs={logs}
              progress={progress.percent}
              scan={scan}
            />
            <AiAssistantPanel
              chatError={aiChatError}
              chatLoading={aiChatLoading}
              messages={aiChat}
              onAsk={(prompt) => void askWorkspaceAi(prompt)}
              onOpenFullReview={() =>
                selectedFinding ? onAskAi(selectedFinding) : undefined
              }
              question={aiQuestion}
              selectedFinding={selectedFinding}
              setQuestion={setAiQuestion}
            />
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 2xl:border-0 2xl:bg-transparent 2xl:p-0">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <TerminalSquare className="h-4 w-4 text-cyan-300" />
                  Scanner progress
                </p>
                <span className="text-xs font-semibold text-cyan-200">
                  {progress.percent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-300 to-indigo-400 transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 2xl:border-0 2xl:bg-transparent 2xl:p-0">
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
                          state === 'waiting'
                            ? 'text-slate-500'
                            : 'text-slate-300',
                        )}
                      >
                        {latestMatchingLog(logs, step.match) ?? 'Waiting'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 lg:col-span-2 xl:col-span-1">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldAlert className="h-4 w-4 text-red-300" />
                Findings in this file
              </p>
              <div className="mt-3 space-y-2">
                {selected?.findings.length ? (
                  selected.findings.map((finding) => (
                    <button
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition',
                        selectedFinding?.id === finding.id
                          ? 'border-cyan-400/30 bg-cyan-400/10'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]',
                      )}
                      key={finding.id}
                      onClick={() => setSelectedFindingId(finding.id)}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-red-200">
                          {finding.severity}
                        </span>
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                          {finding.scanner}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-200">
                        {finding.title}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-xs leading-5 text-slate-500">
                    No saved finding is attached to this selected path.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-400 lg:col-span-2 xl:col-span-3 2xl:col-span-1">
              Source code is scanned in the temporary worker workspace. This UI
              shows masked evidence and finding context, not a persisted copy of
              the repository.
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/10 bg-[#0b1220] px-4 py-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            {scan.branch ?? scan.repository.defaultBranch}
          </span>
          <span>{scan.status.toLowerCase()}</span>
          <span>{findings.length} findings</span>
        </div>
        <span className="font-mono">
          {selectedFinding
            ? `Ln ${selectedFinding.lineStart ?? 1}, Col 1`
            : 'No cursor'}
        </span>
      </div>
    </Card>
  );
}

function ActivityBar({ active }: { active: 'files' | 'problems' }) {
  const items = [
    { icon: Files, key: 'files', label: 'Explorer' },
    { icon: Bug, key: 'problems', label: 'Problems' },
    { icon: TerminalSquare, key: 'terminal', label: 'Terminal' },
    { icon: Bot, key: 'ai', label: 'AI review' },
  ] as const;
  return (
    <nav className="hidden border-r border-white/10 bg-[#07111f] py-3 lg:flex lg:flex-col lg:items-center lg:gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const selected = item.key === active;
        return (
          <button
            aria-label={item.label}
            className={cn(
              'group relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-100',
              selected && 'bg-cyan-400/10 text-cyan-200',
            )}
            key={item.key}
            title={item.label}
            type="button"
          >
            <Icon className="h-5 w-5" />
            {selected ? (
              <span className="absolute left-0 h-6 w-0.5 rounded-full bg-cyan-300" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function TerminalPanel({ logs, scan }: { logs: ScanLog[]; scan: ScanJob }) {
  const visibleLogs = logs.slice(-8);
  return (
    <section className="border-t border-white/10 bg-[#050b14]">
      <div className="flex min-h-9 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.14em]">
          <span className="flex items-center gap-2 text-cyan-200">
            <PanelBottom className="h-4 w-4" />
            Terminal
          </span>
          <span className="text-slate-600">Problems</span>
          <span className="text-slate-600">Output</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          scanner:{scan.status.toLowerCase()}
        </span>
      </div>
      <div className="max-h-48 overflow-auto px-4 py-3 font-mono text-xs leading-6">
        <div className="text-slate-500">
          <span className="text-emerald-300">$</span> kodeye scan --repo{' '}
          {scan.repository.fullName ?? scan.repository.name} --branch{' '}
          {scan.branch ?? scan.repository.defaultBranch}
        </div>
        {visibleLogs.length ? (
          visibleLogs.map((log) => <TerminalLine key={log.id} log={log} />)
        ) : (
          <div className="text-slate-600">
            waiting for scanner worker output...
          </div>
        )}
      </div>
    </section>
  );
}

function TerminalLine({ log }: { log: ScanLog }) {
  const tone =
    log.level === 'error'
      ? 'text-red-300'
      : log.level === 'warn'
        ? 'text-amber-300'
        : 'text-slate-300';
  return (
    <div className="grid grid-cols-[72px_1fr] gap-3">
      <span className="text-slate-600">[{log.level}]</span>
      <span className={cn('whitespace-pre-wrap', tone)}>{log.message}</span>
    </div>
  );
}

function AiScanCoach({
  findings,
  logs,
  progress,
  scan,
}: {
  findings: Finding[];
  logs: ScanLog[];
  progress: number;
  scan: ScanJob;
}) {
  const running = scan.status === 'PENDING' || scan.status === 'RUNNING';
  const done = scan.status === 'SUCCESS';
  const failed = scan.status === 'FAILED';
  const steps = [
    {
      done: logs.length > 0 || progress > 0 || done,
      label: 'Connect remote worker',
      text: running
        ? 'AI reviewer is opening the workspace.'
        : 'Workspace ready.',
    },
    {
      done: progress >= 17 || done,
      label: 'Map repository tree',
      text: 'Identify folders, languages, and scan scope.',
    },
    {
      done: progress >= 50 || done,
      label: 'Run scanners',
      text: 'Check code, secrets, and dependencies.',
    },
    {
      done: findings.length > 0 || progress >= 84 || done,
      label: 'Normalize diagnostics',
      text: findings.length
        ? `${findings.length} finding${findings.length === 1 ? '' : 's'} ready.`
        : 'Waiting for saved findings.',
    },
  ];

  return (
    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-cyan-50">
            {failed ? (
              <XCircle className="h-4 w-4 text-red-300" />
            ) : done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
            )}
            AI scan coach
          </p>
          <p className="mt-1 text-xs leading-5 text-cyan-100/70">
            Remote-style walkthrough. Keep watching this workspace while Kodeye
            checks the repo.
          </p>
        </div>
        <span className="rounded-md bg-slate-950/60 px-2 py-1 font-mono text-xs font-bold text-cyan-100">
          {progress}%
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <div className="flex gap-3" key={step.label}>
            <span
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                step.done
                  ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200'
                  : 'border-cyan-300/20 bg-slate-950/40 text-cyan-200/50',
              )}
            >
              {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-xs font-bold',
                  step.done ? 'text-cyan-50' : 'text-cyan-100/55',
                )}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-cyan-100/60">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiAssistantPanel({
  chatError,
  chatLoading,
  messages,
  onAsk,
  onOpenFullReview,
  question,
  selectedFinding,
  setQuestion,
}: {
  chatError: string;
  chatLoading: boolean;
  messages: AiChatMessage[];
  onAsk: (prompt: string) => void;
  onOpenFullReview: () => void;
  question: string;
  selectedFinding?: Finding;
  setQuestion: (value: string) => void;
}) {
  const quickPrompts = [
    'Explain this finding like a code reviewer.',
    'What exact code change should I make?',
    'How do I verify the fix after editing?',
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            AI code reviewer
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Chat with Kodeye while editing the draft code.
          </p>
        </div>
        {selectedFinding ? (
          <button
            className="rounded-md bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-100 hover:bg-cyan-400/20"
            onClick={onOpenFullReview}
            type="button"
          >
            Fix PR
          </button>
        ) : null}
      </div>

      <div className="mt-3 max-h-56 space-y-2 overflow-auto">
        {messages.map((message, index) => (
          <div
            className={cn(
              'rounded-lg border p-2 text-xs leading-5',
              message.role === 'assistant'
                ? 'border-cyan-400/15 bg-cyan-400/10 text-cyan-50'
                : 'ml-6 border-white/10 bg-white/[0.04] text-slate-200',
            )}
            key={`${message.role}-${index}-${message.text.slice(0, 16)}`}
          >
            <p className="mb-1 font-bold uppercase tracking-[0.12em] text-slate-500">
              {message.role === 'assistant' ? 'Kodeye AI' : 'You'}
            </p>
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        ))}
        {chatLoading ? (
          <div className="flex items-center gap-2 rounded-lg border border-cyan-400/15 bg-cyan-400/10 p-2 text-xs text-cyan-100">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Reviewing code context...
          </div>
        ) : null}
      </div>

      {chatError ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs leading-5 text-red-100">
          {chatError}
        </div>
      ) : null}

      {selectedFinding ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-left text-[11px] font-semibold text-slate-300 hover:bg-white/[0.06]"
              disabled={chatLoading}
              key={prompt}
              onClick={() => onAsk(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        <Textarea
          id="workspace-ai-chat"
          label="Ask AI"
          maxLength={1200}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={
            selectedFinding
              ? 'Ask about the selected code, risk, fix, or verification...'
              : 'Select a finding to ask AI about the code.'
          }
          value={question}
        />
        <button
          className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedFinding || !question.trim() || chatLoading}
          onClick={() => onAsk(question)}
          type="button"
        >
          <Send className="h-4 w-4" />
          Ask AI reviewer
        </button>
      </div>
    </div>
  );
}

function FindingEditorView({
  finding,
  onAskAi,
  onOpenSource,
  source,
  sourceError,
  sourceLoading,
}: {
  finding: Finding;
  onAskAi: (finding: Finding) => void;
  onOpenSource: (finding: Finding) => void;
  source?: AiSourceFile;
  sourceError?: string;
  sourceLoading?: boolean;
}) {
  const lines = source
    ? sourceEditorLines(source.content, finding)
    : editorLines(finding);
  const initialCode = lines.map((line) => line.text).join('\n');
  const [draft, setDraft] = useState(initialCode);

  useEffect(() => {
    setDraft(initialCode);
  }, [initialCode]);

  const dirty = draft !== initialCode;
  return (
    <div>
      <div className="border-b border-white/10 bg-[#07111f] px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={finding.severity} />
              <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {finding.scanner}
              </span>
              {finding.cwe ? (
                <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {finding.cwe}
                </span>
              ) : null}
              {finding.confidence ? (
                <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {finding.confidence} confidence
                </span>
              ) : null}
              <span
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-semibold',
                  dirty
                    ? 'bg-amber-400/10 text-amber-200'
                    : 'bg-white/5 text-slate-300',
                )}
              >
                {dirty ? 'draft edited' : 'editable draft'}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">
              {finding.title}
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
              {finding.description ?? 'No scanner description provided.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 xl:shrink-0 xl:justify-end">
            {dirty ? (
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/5"
                onClick={() => setDraft(initialCode)}
                type="button"
              >
                Reset draft
              </button>
            ) : null}
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/5"
              onClick={() => void onOpenSource(finding)}
              type="button"
            >
              <FileCode2 className="h-4 w-4" />
              {sourceLoading
                ? 'Opening...'
                : source
                  ? 'Source opened'
                  : 'Open source'}
            </button>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500"
              onClick={() => onAskAi(finding)}
              type="button"
            >
              <Bot className="h-4 w-4" /> Ask AI
            </button>
          </div>
        </div>
        {sourceError ? (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-6 text-amber-100">
            {sourceError}
          </div>
        ) : null}
        {source ? (
          <div className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs leading-5 text-cyan-100">
            Opened real source from {source.filePath} on branch {source.branch}.
            Kodeye does not persist this file preview.
          </div>
        ) : null}
      </div>

      <EditableCodePane
        code={draft}
        highlightEnd={finding.lineEnd ?? finding.lineStart ?? lines[0]?.number}
        highlightStart={finding.lineStart ?? lines[0]?.number}
        onChange={setDraft}
        startLine={lines[0]?.number ?? 1}
      />

      {finding.recommendation ? (
        <div className="border-t border-white/10 bg-[#081827] p-5">
          <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm leading-6 text-indigo-100">
            <p className="flex items-center gap-2 font-semibold">
              <Braces className="h-4 w-4" />
              Recommended fix
            </p>
            <p className="mt-1 text-indigo-100/80">{finding.recommendation}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EditableCodePane({
  code,
  highlightEnd,
  highlightStart,
  onChange,
  startLine,
}: {
  code: string;
  highlightEnd?: number;
  highlightStart?: number;
  onChange: (value: string) => void;
  startLine: number;
}) {
  const lines = code.split('\n');
  return (
    <div className="grid min-h-[420px] grid-cols-[64px_minmax(0,1fr)] bg-[#07111f] text-xs leading-6">
      <div className="select-none border-r border-white/10 py-4 text-right font-mono text-slate-600">
        {lines.map((_, index) => {
          const lineNumber = startLine + index;
          const highlighted =
            highlightStart !== undefined &&
            highlightEnd !== undefined &&
            lineNumber >= highlightStart &&
            lineNumber <= highlightEnd;
          return (
            <div
              className={cn(
                'h-6 pr-4',
                highlighted && 'bg-red-500/10 text-red-200',
              )}
              key={`${lineNumber}-${index}`}
            >
              {lineNumber}
            </div>
          );
        })}
      </div>
      <div className="relative min-w-0">
        <div className="pointer-events-none absolute inset-0 py-4">
          {lines.map((_, index) => {
            const lineNumber = startLine + index;
            const highlighted =
              highlightStart !== undefined &&
              highlightEnd !== undefined &&
              lineNumber >= highlightStart &&
              lineNumber <= highlightEnd;
            return (
              <div
                className={cn(
                  'h-6 border-l-2 border-transparent',
                  highlighted &&
                    'border-red-400 bg-red-500/10 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.08)]',
                )}
                key={`${lineNumber}-${index}`}
              />
            );
          })}
        </div>
        <textarea
          aria-label="Editable code draft"
          className="relative z-10 min-h-[420px] w-full resize-none bg-transparent px-4 py-4 font-mono text-xs leading-6 text-slate-200 caret-cyan-300 outline-none selection:bg-cyan-400/25"
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          value={code}
        />
      </div>
    </div>
  );
}

function codeTone(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
    return 'text-slate-500';
  }
  if (
    /^(import|export|const|let|var|function|return|await|async)\b/.test(trimmed)
  ) {
    return 'text-cyan-100';
  }
  if (/[{}[\]();]/.test(trimmed)) {
    return 'text-slate-200';
  }
  if (/['"`].*['"`]/.test(trimmed)) {
    return 'text-emerald-100';
  }
  return 'text-slate-300';
}

function EmptyEditorView({
  file,
  logs,
  progress,
  scan,
}: {
  file?: AuditFile;
  logs: ScanLog[];
  progress: number;
  scan: ScanJob;
}) {
  const lines = pipelineEditorLines(file, logs, progress, scan);
  const StateIcon =
    scan.status === 'FAILED'
      ? XCircle
      : scan.status === 'SUCCESS'
        ? CheckCircle2
        : scan.status === 'RUNNING'
          ? PlayCircle
          : Clock3;
  return (
    <div>
      <div className="border-b border-white/10 bg-[#07111f] px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                <StateIcon
                  className={cn(
                    'h-3.5 w-3.5',
                    scan.status === 'RUNNING' && 'animate-pulse',
                  )}
                />
                {scan.status}
              </span>
              <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {progress}% scanned
              </span>
              <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {logs.length} terminal events
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">
              {file?.isFolder ? 'Scanned folder selected' : 'Scan pipeline'}
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
              {file?.isFolder
                ? `${file.path} came from the scan inventory. Findings will open here as code diagnostics.`
                : `Kodeye is treating ${scan.repository.fullName ?? scan.repository.name} as an editor workspace while the scanner runs.`}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#07111f] py-4">
        <pre className="min-w-full text-xs leading-6 text-slate-300">
          {lines.map((line, index) => (
            <div
              className={cn(
                'grid min-h-6 grid-cols-[64px_1fr] border-l-2 border-transparent px-3',
                line.highlight && 'border-cyan-400 bg-cyan-400/10 text-cyan-50',
                !line.highlight && 'hover:bg-white/[0.035]',
              )}
              key={`${line.number}-${index}`}
            >
              <span className="select-none border-r border-white/10 pr-4 text-right text-slate-600">
                {line.number}
              </span>
              <code
                className={cn(
                  'whitespace-pre-wrap px-4 font-mono',
                  codeTone(line.text),
                )}
              >
                {line.text || ' '}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function pipelineEditorLines(
  file: AuditFile | undefined,
  logs: ScanLog[],
  progress: number,
  scan: ScanJob,
) {
  const repository = scan.repository.fullName ?? scan.repository.name;
  const latestLog = logs.at(-1)?.message ?? 'waiting for scanner worker';
  const target = file?.path ?? repository;
  const running = scan.status === 'RUNNING' || scan.status === 'PENDING';
  return [
    { highlight: false, number: 1, text: `// Kodeye scan workspace` },
    { highlight: false, number: 2, text: `// Repository: ${repository}` },
    {
      highlight: false,
      number: 3,
      text: `// Branch: ${scan.branch ?? scan.repository.defaultBranch}`,
    },
    { highlight: false, number: 4, text: `// Target: ${target}` },
    { highlight: false, number: 5, text: '' },
    { highlight: running, number: 6, text: 'const scan = await kodeye.scan({' },
    { highlight: false, number: 7, text: `  status: '${scan.status}',` },
    { highlight: false, number: 8, text: `  progress: ${progress},` },
    {
      highlight: false,
      number: 9,
      text: `  scannerEvents: ${logs.length},`,
    },
    { highlight: false, number: 10, text: `  latest: '${latestLog}',` },
    { highlight: false, number: 11, text: '});' },
    { highlight: false, number: 12, text: '' },
    {
      highlight: scan.status === 'SUCCESS',
      number: 13,
      text:
        scan.status === 'SUCCESS'
          ? '// Done. Open a finding file from Explorer to review diagnostics.'
          : '// Keep this editor open. Terminal output updates as scanner logs arrive.',
    },
  ];
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

function foldersFromScanLogs(logs: ScanLog[], scan: ScanJob): AuditFile[] {
  const folderLog = [...logs]
    .reverse()
    .find((log) =>
      log.message.toLowerCase().startsWith('top audited folders:'),
    );
  const value = folderLog?.message.split(':').slice(1).join(':').trim();
  if (!value || value === 'repository root only') {
    return [
      {
        findings: [],
        isFolder: true,
        path: `${scan.repository.fullName ?? scan.repository.name}/`,
      },
    ];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((path) => ({
      findings: [],
      isFolder: true,
      path: path.endsWith('/') ? path : `${path}/`,
    }));
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

function sourceEditorLines(content: string, finding: Finding) {
  const allLines = content.split(/\r?\n/);
  const startLine = Math.max(1, finding.lineStart ?? 1);
  const endLine = Math.max(startLine, finding.lineEnd ?? startLine);
  const windowStart = Math.max(1, startLine - 12);
  const windowEnd = Math.min(allLines.length, endLine + 18);

  return allLines.slice(windowStart - 1, windowEnd).map((text, index) => {
    const number = windowStart + index;
    return {
      highlight: number >= startLine && number <= endLine,
      number,
      text,
    };
  });
}
