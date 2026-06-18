'use client';

import {
  Bot,
  ExternalLink,
  GitPullRequest,
  Send,
  WandSparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { aiApi } from '../../features/ai/api';
import type { AiFindingReview } from '../../features/ai/types';
import type { AiFixProposal, AiFixPullRequest } from '../../features/ai/types';
import type { Finding, ScanJob } from '../../features/scans/types';
import { getErrorMessage } from '../../lib/utils';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
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
        <div className="space-y-4">
          {(() => {
            const eligibility = fixEligibility(finding, scan);
            return (
              <>
          <Alert>
            Ask AI sends sanitized finding metadata only. Single-file AI fix and
            pull request are available only for connected GitHub findings that
            target a safe source file.
          </Alert>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              <p className="font-semibold text-slate-950">{finding.title}</p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {finding.filePath ?? 'Location not provided'}
              {finding.lineStart ? `:${finding.lineStart}` : ''}
            </p>
          </div>

          {!review && !loading ? (
            <Button className="w-full" onClick={() => void askAi()}>
              <Bot className="h-4 w-4" /> Explain and recommend a fix
            </Button>
          ) : null}
          {loading ? (
            <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">
              <Spinner /> AI is reviewing the sanitized finding...
            </div>
          ) : null}
          {error ? <Alert tone="error">{error}</Alert> : null}
          {review ? <ReviewResult review={review} /> : null}

          {eligibility.ok ? (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-950">
                Generate a single-file fix proposal
              </p>
              <p className="text-sm leading-6 text-amber-800">
                This sends the complete target file to Groq temporarily.
                Nothing is committed until you inspect the proposal and approve
                creating a pull request.
              </p>
              <Button
                disabled={fixLoading}
                onClick={() => void generateFix()}
                variant="secondary"
              >
                <WandSparkles className="h-4 w-4" />
                {fixLoading && !fixProposal
                  ? 'Generating fix...'
                  : 'Generate Fix'}
              </Button>
            </div>
          ) : (
            <Alert>
              <p className="font-semibold">AI pull request is unavailable.</p>
              <p className="mt-1">{eligibility.reason}</p>
            </Alert>
          )}

          {fixProposal ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-indigo-50 p-4">
                <p className="font-semibold text-indigo-950">
                  {fixProposal.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-indigo-800">
                  {fixProposal.summary}
                </p>
                <p className="mt-2 font-mono text-xs text-indigo-700">
                  {fixProposal.commitMessage}
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <CodePreview
                  content={fixProposal.originalContent}
                  title="Current file"
                />
                <CodePreview
                  content={fixProposal.proposedContent}
                  title="Proposed file"
                />
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
                <input
                  checked={approved}
                  className="mt-1"
                  onChange={(event) => setApproved(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  I reviewed this complete file replacement and approve Kodeye
                  creating a new branch, committing only this file, and opening
                  a pull request. Kodeye will never push directly to the default
                  branch.
                </span>
              </label>
              <Button
                className="w-full"
                disabled={!approved || fixLoading || Boolean(pullRequest)}
                onClick={() => void createPullRequest()}
              >
                <GitPullRequest className="h-4 w-4" />
                {fixLoading
                  ? 'Creating pull request...'
                  : 'Approve & Create Pull Request'}
              </Button>
            </div>
          ) : null}

          {pullRequest ? (
            <Alert tone="success">
              <p className="font-semibold">
                Pull request #{pullRequest.pullRequestNumber} created on branch{' '}
                {pullRequest.branch}.
              </p>
              <a
                className="mt-2 inline-flex items-center gap-2 font-semibold underline"
                href={pullRequest.pullRequestUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open Pull Request <ExternalLink className="h-4 w-4" />
              </a>
            </Alert>
          ) : null}

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <Textarea
              id="ai-question"
              label="Ask a follow-up question"
              maxLength={2000}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Is this exploitable? What should I verify before applying the fix?"
              value={question}
            />
            <Button
              className="w-full"
              disabled={!question.trim() || loading}
              onClick={() => void askAi(question)}
              variant="secondary"
            >
              <Send className="h-4 w-4" /> Ask AI
            </Button>
          </div>
              </>
            );
          })()}
        </div>
      ) : null}
    </Modal>
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

function CodePreview({ content, title }: { content: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <pre className="mt-2 max-h-96 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-200">
        {content}
      </pre>
    </div>
  );
}

function ReviewResult({ review }: { review: AiFindingReview }) {
  return (
    <div className="space-y-4 rounded-xl bg-slate-50 p-4">
      <Badge tone="primary">AI confidence: {review.confidence}</Badge>
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
          <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-200">
            {review.fixExample}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function ReviewSection({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function ReviewList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <ol className="mt-2 space-y-2 text-sm text-slate-700">
        {values.map((value, index) => (
          <li key={`${index}-${value}`}>
            {index + 1}. {value}
          </li>
        ))}
      </ol>
    </div>
  );
}
