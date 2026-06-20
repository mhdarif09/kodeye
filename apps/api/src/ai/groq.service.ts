import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import { AppSettingsService } from '../settings/app-settings.service';
import type { AiFindingReview } from './ai.types';

interface GroqResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
}

@Injectable()
export class GroqService {
  constructor(private readonly settings: AppSettingsService) {}

  async reviewFinding(context: string, question?: string) {
    return this.request<AiFindingReview>(
      [
        {
          content: systemPrompt,
          role: 'system',
        },
        {
          content: `${context}\n\nUser question: ${question?.trim() || 'Explain this finding and recommend a safe fix.'}`,
          role: 'user',
        },
      ],
      normalizeReview,
      this.settings.getNumber('AI_MAX_COMPLETION_TOKENS', 1200),
    );
  }

  async generateFix(context: string, sourceCode: string, instruction?: string) {
    return this.request<{
      commitMessage: string;
      explanation: string;
      patch: string;
      proposedContent: string;
      risk: 'critical' | 'high' | 'medium' | 'low';
      rootCause: string;
      sideEffects: string[];
      summary: string;
      tests: string[];
      title: string;
    }>(
      [
        { content: fixSystemPrompt, role: 'system' },
        {
          content: `${context}

User instruction: ${instruction?.trim() || 'Create the smallest safe fix for this finding.'}

Complete source file:
${sourceCode}`,
          role: 'user',
        },
      ],
      normalizeFix,
      this.settings.getNumber('AI_FIX_MAX_COMPLETION_TOKENS', 16_000),
    );
  }

  private async request<T>(
    messages: Array<{ content: string; role: 'system' | 'user' }>,
    normalize: (value: Record<string, unknown>) => T,
    maxCompletionTokens: number,
  ): Promise<T> {
    if (!this.settings.getBoolean('AI_ENABLED', false)) {
      throw new ServiceUnavailableException('AI review is disabled');
    }
    const apiKey = this.settings.getSecret('GROQ_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('Groq API is not configured');
    }
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        body: JSON.stringify({
          max_completion_tokens: maxCompletionTokens,
          messages,
          model: this.settings.getString(
            'GROQ_MODEL',
            'llama-3.3-70b-versatile',
          ),
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: AbortSignal.timeout(
          this.settings.getNumber('AI_REQUEST_TIMEOUT_MS', 30_000),
        ),
      },
    );
    if (!response.ok) {
      throw new BadGatewayException(
        `Groq AI review failed (${response.status})`,
      );
    }
    const payload = (await response.json()) as GroqResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content)
      throw new BadGatewayException('Groq returned an empty review');

    try {
      return normalize(JSON.parse(content) as Record<string, unknown>);
    } catch {
      throw new BadGatewayException('Groq returned an invalid review');
    }
  }
}

const systemPrompt = `You are Kodeye's secure code-review assistant.
You are the built-in AI coding assistant for Kodeye's code editor.
You help users read, review, debug, and secure their code.

Rules:
- Always ground answers in the supplied scanner finding metadata and source context.
- Do not invent files, functions, dependencies, scan results, tests, or runtime behavior.
- When making claims about code, mention file paths and line numbers from the supplied context when possible.
- If source code is not supplied, say that scanner evidence is available but source inspection is missing.
- If scanner results are missing or incomplete, say what evidence is missing.
- Never expose raw secrets. Redact secret-like values before explaining issues.
- Prefer minimal safe remediation guidance.
- Do not over-refactor or change unrelated behavior in examples.
- Do not suggest suppressing scanner findings without a clear technical reason.
- Explain security issues clearly and map vulnerabilities to CWE and OWASP when relevant.
- Never claim a scanner or terminal command was run unless the supplied context says it was run.
- Never imply code changes were applied. This assistant can propose changes, but the user must approve them.

Return valid JSON with exactly these fields:
{
  "explanation": "clear explanation",
  "risk": "realistic exploitation impact and conditions",
  "confidence": "HIGH|MEDIUM|LOW",
  "remediationSteps": ["ordered remediation step"],
  "verificationSteps": ["ordered verification step"],
  "fixExample": "short generic code or configuration example, or null"
}
Be explicit when runtime validation or manual review is required. Never include markdown fences.`;

const fixSystemPrompt = `You are Kodeye's secure code-fix assistant.
You are the built-in AI coding assistant for Kodeye's code editor.
You are fixing a scanner finding using the supplied finding context and complete affected source file.

Rules:
- Always ground answers in the supplied finding and source file only.
- Do not invent files, functions, dependencies, scanner results, tests, or terminal output.
- When making claims about code, mention the supplied file path and line numbers when possible.
- If scanner results or related file context are missing, say what evidence is missing.
- Never expose raw secrets. Redact any secret-like value in explanations, patches, and examples.
- Make the smallest safe change that addresses the finding.
- Do not rewrite the whole file unless absolutely necessary.
- Preserve public API behavior, formatting style, and unrelated logic.
- Do not add dependencies unless the existing file already uses them and the change is unavoidable.
- Do not suppress scanner findings without a clear technical reason.
- For SQL injection, prefer parameterized queries.
- For command injection, avoid shell execution and use argument arrays.
- For path traversal, normalize paths and enforce a trusted root boundary.
- For XSS, escape output or use framework-safe rendering.
- For SSRF, validate protocol, host, IP ranges, and redirects.
- For secrets, remove the secret value and recommend rotation without showing the raw secret.
- Never apply code changes. Generate a proposal only; the user must approve before anything is applied.
- Never run terminal commands. Recommend tests to run instead.
- Explain security issues clearly and map vulnerabilities to CWE and OWASP when relevant.
- Return the patch only after explanation fields.
- The explanation/rootCause/risk/tests/sideEffects fields are user-facing and must be specific to the supplied finding.
- Keep the patch as a unified diff and keep the complete proposedContent consistent with that patch.

Return valid JSON with exactly these fields:
{
  "explanation": "vulnerability explanation grounded in the scanner finding and affected file",
  "rootCause": "specific root cause in the affected file",
  "risk": "critical|high|medium|low",
  "patch": "unified diff patch for the supplied file",
  "tests": ["specific test or command the user should run"],
  "sideEffects": ["possible side effect or compatibility concern"],
  "title": "pull request title",
  "commitMessage": "conventional commit message",
  "proposedContent": "complete replacement source file"
}`;

function normalizeReview(value: Record<string, unknown>): AiFindingReview {
  const confidence = ['HIGH', 'MEDIUM', 'LOW'].includes(
    String(value.confidence),
  )
    ? (String(value.confidence) as AiFindingReview['confidence'])
    : 'LOW';
  return {
    confidence,
    explanation: redactSecrets(requiredText(value.explanation)),
    fixExample:
      typeof value.fixExample === 'string'
        ? redactSecrets(value.fixExample).slice(0, 4000)
        : null,
    remediationSteps: textArray(value.remediationSteps).map(redactSecrets),
    risk: redactSecrets(requiredText(value.risk)),
    verificationSteps: textArray(value.verificationSteps).map(redactSecrets),
  };
}

function requiredText(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Missing AI review field');
  }
  return value.trim().slice(0, 4000);
}

function textArray(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error('Missing AI review list');
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, 1000))
    .filter(Boolean)
    .slice(0, 10);
}

function normalizeFix(value: Record<string, unknown>) {
  const explanation = redactSecrets(requiredText(value.explanation));
  const rootCause = redactSecrets(requiredText(value.rootCause));
  const risk = normalizeRisk(value.risk);
  const tests = textArray(value.tests).map(redactSecrets);
  const sideEffects = textArray(value.sideEffects).map(redactSecrets);
  return {
    commitMessage: redactSecrets(requiredText(value.commitMessage)).slice(
      0,
      500,
    ),
    explanation,
    patch: redactSecrets(requiredLongText(value.patch, 100_000)),
    proposedContent: redactSecrets(
      requiredLongText(value.proposedContent, 200_000),
    ),
    risk,
    rootCause,
    sideEffects,
    summary: [
      `Risk: ${risk}. ${explanation}`,
      `Root cause: ${rootCause}`,
      `Tests: ${tests.join('; ') || 'Manual verification required.'}`,
      `Side effects: ${sideEffects.join('; ') || 'No specific side effects identified from the supplied context.'}`,
    ].join('\n'),
    tests,
    title: redactSecrets(requiredText(value.title)).slice(0, 255),
  };
}

function normalizeRisk(value: unknown): 'critical' | 'high' | 'medium' | 'low' {
  const risk = String(value).toLowerCase();
  if (['critical', 'high', 'medium', 'low'].includes(risk)) {
    return risk as 'critical' | 'high' | 'medium' | 'low';
  }
  return 'medium';
}

function requiredLongText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string' || !value) {
    throw new Error('Missing AI fix content');
  }
  return value.slice(0, maxLength);
}

function redactSecrets(value: string): string {
  return value
    .replace(
      /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
      '[REDACTED_PRIVATE_KEY]',
    )
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED_AWS_KEY]')
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g, '[REDACTED_SLACK_TOKEN]')
    .replace(
      /\b(authorization\s*:\s*bearer\s+)[A-Za-z0-9._~+/=-]{12,}/gi,
      '$1[REDACTED_TOKEN]',
    )
    .replace(
      /\b(password|secret|token|api[_-]?key)\s*[:=]\s*(['"]?)[^'"\s]{8,}\2/gi,
      '$1=[REDACTED_SECRET]',
    );
}
