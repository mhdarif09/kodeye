'use client';

import {
  Bot,
  Braces,
  CheckCircle2,
  ChevronRight,
  Circle,
  ExternalLink,
  FileCode2,
  GitPullRequest,
  Loader2,
  Send,
  ShieldAlert,
  TerminalSquare,
  WandSparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { aiApi } from '../../features/ai/api';
import type { AiFindingReview } from '../../features/ai/types';
import type { AiFixProposal, AiFixPullRequest } from '../../features/ai/types';
import type { Finding, ScanJob } from '../../features/scans/types';
import { cn, getErrorMessage } from '../../lib/utils';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { Spinner } from '../ui/spinner';
import { Textarea } from '../ui/textarea';

export function FindingAiModal({
  finding,
  onClose,
  scan,
}: {
  finding: Finding | null;
  onClose: () => void;
  scan?: ScanJob | null;
}) {
  const [question, setQuestion] = useState('');
  const [review, setReview] = useState<AiFindingReview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [fixProposal, setFixProposal] = useState<AiFixProposal | null>(null);
  const [pullRequest, setPullRequest] = useState<AiFixPullRequest | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    setQuestion('');
    setReview(null);
    setError('');
    setFixProposal(null);
    setPullRequest(null);
    setApproved(false);
  }, [finding]);

  async function askAi(prompt?: string) {
    if (!finding || loading) return;
    setLoading(true);
    setError('');
    try {
      setReview(await aiApi.reviewFinding(finding.id, prompt));
      setQuestion('');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function generateFix() {
    if (!finding || fixLoading || !fixEligibility(finding, scan).ok) return;
    setFixLoading(true);
    setError('');
    setPullRequest(null);
    setApproved(false);
    try {
      setFixProposal(await aiApi.generateFix(finding.id));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setFixLoading(false);
    }
  }

  async function createPullRequest() {
    if (!finding || !fixProposal || !approved || fixLoading) return;
    setFixLoading(true);
    setError('');
    try {
      setPullRequest(await aiApi.createFixPullRequest(finding.id, fixProposal));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setFixLoading(false);
    }
  }

  return (
    <Modal
      description={
        finding
          ? `${finding.severity} | ${finding.category} | ${finding.cwe ?? 'No CWE'}`
          : undefined
      }
      isOpen={Boolean(finding)}
      onClose={onClose}
      title="Kodeye AI Review"
      wide
    >
      {finding ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#07111f] text-slate-100 shadow-2xl shadow-slate-200">
          {(() => {
            const eligibility = fixEligibility(finding, scan);
            return (
              <>
                <EditorChrome finding={finding} scan={scan} />
                <div className="grid min-h-[640px] xl:grid-cols-[minmax(680px,1fr)_380px]">
                  <main className="min-w-0 border-b border-white/10 xl:border-b-0 xl:border-r">
                    <EditorTab finding={finding} />
                    <div className="flex items-center gap-1 border-b border-white/10 px-4 py-2 text-xs text-slate-500">
                      <span className="truncate">
                        {scan?.repository.fullName ??
                          scan?.repository.name ??
                          'repository'}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate font-mono text-slate-300">
                        {finding.filePath ?? 'finding.json'}
                      </span>
                    </div>
                    <div className="max-h-none overflow-visible xl:max-h-[585px] xl:overflow-auto">
                      <FindingEditorView finding={finding} />

                      <section className="border-t border-white/10 bg-[#081827] p-5">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-bold text-white">
                              <Bot className="h-4 w-4 text-cyan-300" />
                              AI reviewer
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Sanitized finding context only. Full-file fix is
                              requested separately.
                            </p>
                          </div>
                          {!review && !loading ? (
                            <Button
                              className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                              onClick={() => void askAi()}
                            >
                              <Bot className="h-4 w-4" /> Review finding
                            </Button>
                          ) : null}
                        </div>
                        {loading ? (
                          <div className="flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
                            <Spinner /> AI is reviewing the sanitized finding...
                          </div>
                        ) : null}
                        {error ? (
                          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
                            {error}
                          </div>
                        ) : null}
                        {review ? <ReviewResult review={review} /> : null}
                      </section>

                      {fixProposal ? (
                        <section className="border-t border-white/10 bg-[#07111f] p-5">
                          <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="flex items-center gap-2 font-semibold text-indigo-100">
                                <Braces className="h-4 w-4" />
                                {fixProposal.title}
                              </p>
                              <span
                                className={cn(
                                  'rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]',
                                  fixProposal.risk === 'critical' ||
                                    fixProposal.risk === 'high'
                                    ? 'bg-red-400/20 text-red-100'
                                    : fixProposal.risk === 'medium'
                                      ? 'bg-amber-400/20 text-amber-100'
                                      : 'bg-emerald-400/20 text-emerald-100',
                                )}
                              >
                                {fixProposal.risk} risk
                              </span>
                            </div>
                            <div className="mt-3 grid gap-3 text-sm leading-6 text-indigo-100/80 md:grid-cols-2">
                              <FixDetail
                                title="Explanation"
                                value={fixProposal.explanation}
                              />
                              <FixDetail
                                title="Root cause"
                                value={fixProposal.rootCause}
                              />
                              <FixDetailList
                                items={fixProposal.tests}
                                title="Tests to run"
                              />
                              <FixDetailList
                                items={fixProposal.sideEffects}
                                title="Possible side effects"
                              />
                            </div>
                            <p className="mt-2 font-mono text-xs text-indigo-200/80">
                              {fixProposal.commitMessage}
                            </p>
                          </div>
                          <PatchPreview content={fixProposal.patch} />
                          <div className="mt-4 grid gap-4 xl:grid-cols-2">
                            <CodePreview
                              content={fixProposal.originalContent}
                              tone="old"
                              title="Current file"
                            />
                            <CodePreview
                              content={fixProposal.proposedContent}
                              tone="new"
                              title="Proposed file"
                            />
                          </div>
                          <label className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                            <input
                              checked={approved}
                              className="mt-1 accent-cyan-400"
                              onChange={(event) =>
                                setApproved(event.target.checked)
                              }
                              type="checkbox"
                            />
                            <span>
                              I reviewed this complete file replacement and
                              approve Kodeye creating a new branch, committing
                              only this file, and opening a pull request. Kodeye
                              will never push directly to the default branch.
                            </span>
                          </label>
                          <Button
                            className="mt-4 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                            disabled={
                              !approved || fixLoading || Boolean(pullRequest)
                            }
                            onClick={() => void createPullRequest()}
                          >
                            <GitPullRequest className="h-4 w-4" />
                            {fixLoading
                              ? 'Creating pull request...'
                              : 'Approve & Create Pull Request'}
                          </Button>
                        </section>
                      ) : null}
                    </div>
                  </main>

                  <aside className="bg-[#0a1322]">
                    <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Inspector
                    </div>
                    <div className="grid max-h-none gap-4 overflow-visible p-4 md:grid-cols-2 xl:block xl:max-h-[640px] xl:space-y-4 xl:overflow-auto">
                      <InspectorPanel finding={finding} scan={scan} />
                      <FixPanel
                        eligibility={eligibility}
                        fixLoading={fixLoading}
                        fixProposal={fixProposal}
                        generateFix={generateFix}
                      />
                      {pullRequest ? (
                        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
                          <p className="font-semibold">
                            Pull request #{pullRequest.pullRequestNumber}{' '}
                            created on branch {pullRequest.branch}.
                          </p>
                          <a
                            className="mt-2 inline-flex items-center gap-2 font-semibold underline"
                            href={pullRequest.pullRequestUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open Pull Request{' '}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ) : null}
                      <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 md:col-span-2 xl:col-span-1">
                        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                          <TerminalSquare className="h-4 w-4 text-cyan-300" />
                          Follow-up console
                        </p>
                        <Textarea
                          id="ai-question"
                          label="Ask a follow-up question"
                          maxLength={2000}
                          onChange={(event) => setQuestion(event.target.value)}
                          placeholder="Is this exploitable? What should I verify before applying the fix?"
                          value={question}
                        />
                        <Button
                          className="mt-3 w-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                          disabled={!question.trim() || loading}
                          onClick={() => void askAi(question)}
                          variant="secondary"
                        >
                          <Send className="h-4 w-4" /> Ask AI
                        </Button>
                      </div>
                    </div>
                  </aside>
                </div>
                <div className="flex flex-col gap-2 border-t border-white/10 bg-[#0b1220] px-4 py-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>{finding.scanner}</span>
                    <span>{finding.severity.toLowerCase()}</span>
                    <span>{finding.status.toLowerCase()}</span>
                  </div>
                  <span className="font-mono">
                    Ln {finding.lineStart ?? 1}, Col 1
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      ) : null}
    </Modal>
  );
}

function EditorChrome({
  finding,
  scan,
}: {
  finding: Finding;
  scan?: ScanJob | null;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between border-b border-white/10 bg-[#0b1220] px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="hidden h-5 w-px bg-white/10 sm:block" />
        <p className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-300">
          <ShieldAlert className="h-4 w-4 text-cyan-300" />
          <span className="truncate">
            {scan?.repository.fullName ?? scan?.repository.name ?? 'Kodeye'}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="hidden rounded-md bg-white/5 px-2.5 py-1 font-mono sm:inline">
          {finding.filePath ?? 'repository'}
        </span>
        <span className="rounded-md bg-red-500/15 px-2.5 py-1 font-semibold text-red-200">
          {finding.severity}
        </span>
      </div>
    </div>
  );
}

function EditorTab({ finding }: { finding: Finding }) {
  return (
    <div className="flex min-h-11 items-end gap-1 border-b border-white/10 bg-[#0a1322] px-3">
      <div className="flex max-w-full items-center gap-2 rounded-t-lg border-x border-t border-white/10 bg-[#07111f] px-3 py-2">
        <FileCode2 className="h-4 w-4 shrink-0 text-cyan-300" />
        <span className="truncate font-mono text-xs text-slate-200">
          {finding.filePath ?? 'finding.json'}
        </span>
        <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-200">
          issue
        </span>
      </div>
    </div>
  );
}

function FindingEditorView({ finding }: { finding: Finding }) {
  const lines = findingLines(finding);
  return (
    <section>
      <div className="border-b border-white/10 bg-[#07111f] px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <FindingPill tone="danger">{finding.severity}</FindingPill>
          <FindingPill>{finding.scanner}</FindingPill>
          {finding.cwe ? <FindingPill>{finding.cwe}</FindingPill> : null}
          {finding.owasp ? <FindingPill>{finding.owasp}</FindingPill> : null}
          <FindingPill>{finding.confidence} confidence</FindingPill>
        </div>
        <h3 className="mt-3 text-lg font-bold text-white">{finding.title}</h3>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
          {finding.description ?? 'No scanner description provided.'}
        </p>
      </div>
      <LineCodeBlock lines={lines} highlightLine={finding.lineStart ?? 4} />
    </section>
  );
}

function InspectorPanel({
  finding,
  scan,
}: {
  finding: Finding;
  scan?: ScanJob | null;
}) {
  const checks = [
    { label: 'Scanner signal', value: finding.scanner, done: true },
    { label: 'File target', value: finding.filePath ?? 'Missing', done: true },
    {
      label: 'GitHub PR fix',
      value: scan?.repository.provider === 'GITHUB' ? 'Available' : 'Locked',
      done: scan?.repository.provider === 'GITHUB',
    },
  ];
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
      <p className="flex items-center gap-2 text-sm font-bold text-white">
        <ShieldAlert className="h-4 w-4 text-red-300" />
        Diagnostic context
      </p>
      <div className="mt-3 space-y-3">
        {checks.map((check) => (
          <div className="flex items-start gap-3" key={check.label}>
            {check.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 text-slate-600" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-300">
                {check.label}
              </p>
              <p className="truncate text-xs text-slate-500">{check.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FixPanel({
  eligibility,
  fixLoading,
  fixProposal,
  generateFix,
}: {
  eligibility: { ok: true } | { ok: false; reason: string };
  fixLoading: boolean;
  fixProposal: AiFixProposal | null;
  generateFix: () => Promise<void>;
}) {
  if (!eligibility.ok) {
    return (
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
        <p className="font-semibold">AI pull request is unavailable.</p>
        <p className="mt-1 text-amber-100/80">{eligibility.reason}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
      <p className="flex items-center gap-2 font-semibold text-cyan-100">
        <WandSparkles className="h-4 w-4" />
        Fix generator
      </p>
      <p className="mt-2 text-sm leading-6 text-cyan-100/75">
        Sends the complete target file temporarily, then returns a single-file
        replacement for review.
      </p>
      <Button
        className="mt-3 w-full border-cyan-300/20 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/20"
        disabled={fixLoading}
        onClick={() => void generateFix()}
        variant="secondary"
      >
        {fixLoading && !fixProposal ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <WandSparkles className="h-4 w-4" />
        )}
        {fixLoading && !fixProposal ? 'Generating fix...' : 'Generate Fix'}
      </Button>
    </div>
  );
}

function fixEligibility(
  finding: Finding,
  scan?: ScanJob | null,
): { ok: true } | { ok: false; reason: string } {
  if (scan?.repository.provider !== 'GITHUB') {
    return {
      ok: false,
      reason:
        'Automatic fix pull requests require a connected GitHub App repository. Manual public repository scans can still use Ask AI for explanation and remediation guidance.',
    };
  }
  if (!finding.filePath) {
    return {
      ok: false,
      reason:
        'This finding is not tied to a specific file path, so Kodeye cannot safely create a single-file pull request.',
    };
  }
  if (isBlockedPath(finding.filePath)) {
    return {
      ok: false,
      reason:
        'This finding targets a sensitive or non-writable path such as secrets, private keys, environment files, or GitHub workflow files. Ask AI can explain the fix, but Kodeye will not write this file automatically.',
    };
  }
  return { ok: true };
}

function isBlockedPath(filePath: string): boolean {
  const normalized = filePath.replaceAll('\\', '/').toLowerCase();
  return (
    normalized.startsWith('/') ||
    normalized.includes('../') ||
    normalized.startsWith('.github/workflows/') ||
    /(^|\/)(\.env(?:\.|$)|.*(?:secret|credential|private.?key).*)/i.test(
      normalized,
    )
  );
}

function CodePreview({
  content,
  title,
  tone,
}: {
  content: string;
  title: string;
  tone: 'new' | 'old';
}) {
  const lines = content.split('\n');
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          <FileCode2 className="h-4 w-4 text-cyan-300" />
          {title}
        </p>
        <span
          className={cn(
            'rounded px-2 py-0.5 text-[10px] font-bold',
            tone === 'new'
              ? 'bg-emerald-500/15 text-emerald-200'
              : 'bg-red-500/15 text-red-200',
          )}
        >
          {tone === 'new' ? 'proposed' : 'current'}
        </span>
      </div>
      <pre className="max-h-96 overflow-auto py-3 text-xs leading-6 text-slate-300">
        {lines.map((line, index) => (
          <div
            className={cn(
              'grid min-h-6 grid-cols-[56px_1fr] px-3',
              tone === 'new' && 'bg-emerald-500/[0.03]',
              tone === 'old' && 'bg-red-500/[0.025]',
            )}
            key={`${index}-${line}`}
          >
            <span className="select-none border-r border-white/10 pr-3 text-right text-slate-600">
              {index + 1}
            </span>
            <code className="whitespace-pre px-4 font-mono">{line || ' '}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}

function PatchPreview({ content }: { content: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          <Braces className="h-4 w-4 text-cyan-300" />
          Unified diff patch
        </p>
        <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-100">
          review before approval
        </span>
      </div>
      <pre className="max-h-80 overflow-auto p-3 text-xs leading-6 text-slate-300">
        {content}
      </pre>
    </div>
  );
}

function ReviewResult({ review }: { review: AiFindingReview }) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-4">
      <FindingPill tone="info">AI confidence: {review.confidence}</FindingPill>
      <ReviewSection title="Explanation" value={review.explanation} />
      <ReviewSection title="Risk" value={review.risk} />
      <ReviewList title="Remediation steps" values={review.remediationSteps} />
      <ReviewList
        title="Verification steps"
        values={review.verificationSteps}
      />
      {review.fixExample ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Generic fix example
          </p>
          <LineCodeBlock lines={review.fixExample.split('\n')} />
        </div>
      ) : null}
    </div>
  );
}

function FixDetail({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-200/70">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-indigo-50/85">{value}</p>
    </div>
  );
}

function FixDetailList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-200/70">
        {title}
      </p>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-indigo-50/85">
        {items.length ? (
          items.map((item) => <li key={item}>- {item}</li>)
        ) : (
          <li>- Manual verification required.</li>
        )}
      </ul>
    </div>
  );
}

function ReviewSection({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function ReviewList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <ol className="mt-2 space-y-2 text-sm text-slate-300">
        {values.map((value, index) => (
          <li key={`${index}-${value}`}>
            {index + 1}. {value}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FindingPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'danger' | 'info' | 'neutral';
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2.5 py-1 text-xs font-semibold',
        tone === 'danger' && 'bg-red-500/15 text-red-200',
        tone === 'info' && 'bg-cyan-400/10 text-cyan-100',
        tone === 'neutral' && 'bg-white/5 text-slate-300',
      )}
    >
      {children}
    </span>
  );
}

function LineCodeBlock({
  highlightLine,
  lines,
}: {
  highlightLine?: number;
  lines: string[];
}) {
  return (
    <pre className="overflow-x-auto bg-[#07111f] py-4 text-xs leading-6 text-slate-300">
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        return (
          <div
            className={cn(
              'grid min-h-6 grid-cols-[64px_1fr] border-l-2 border-transparent px-3',
              highlightLine === lineNumber &&
                'border-red-400 bg-red-500/10 text-red-50',
              highlightLine !== lineNumber && 'hover:bg-white/[0.035]',
            )}
            key={`${lineNumber}-${line}`}
          >
            <span className="select-none border-r border-white/10 pr-4 text-right text-slate-600">
              {lineNumber}
            </span>
            <code
              className={cn(
                'whitespace-pre-wrap px-4 font-mono',
                codeTone(line),
              )}
            >
              {line || ' '}
            </code>
          </div>
        );
      })}
    </pre>
  );
}

function findingLines(finding: Finding): string[] {
  return [
    `// ${finding.filePath ?? 'repository'}:${finding.lineStart ?? 1}`,
    `// Scanner: ${finding.scanner}`,
    `// Severity: ${finding.severity} | Confidence: ${finding.confidence}`,
    finding.evidenceMasked ?? finding.description ?? finding.title,
    '',
    'reviewFinding({',
    `  category: '${finding.category}',`,
    `  cwe: '${finding.cwe ?? 'none'}',`,
    `  impact: '${finding.impact ?? 'pending ai review'}',`,
    `  recommendation: '${finding.recommendation ?? 'ask ai for remediation'}',`,
    '});',
  ];
}

function codeTone(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('#'))
    return 'text-slate-500';
  if (
    /^(import|export|const|let|var|function|return|await|async)\b/.test(trimmed)
  ) {
    return 'text-cyan-100';
  }
  if (/[{}[\]();]/.test(trimmed)) return 'text-slate-200';
  if (/['"`].*['"`]/.test(trimmed)) return 'text-emerald-100';
  return 'text-slate-300';
}
