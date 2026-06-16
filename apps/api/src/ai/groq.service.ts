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
      proposedContent: string;
      summary: string;
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
Analyze only the sanitized finding metadata provided. Do not claim you inspected source code.
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
Return the complete replacement content for the single source file provided.
Make the smallest safe change that addresses the finding. Preserve unrelated formatting and behavior.
Do not add dependencies, secrets, placeholders, markdown fences, or changes outside the supplied file.
Return valid JSON with exactly these fields:
{
  "summary": "short explanation of the proposed change",
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
    explanation: requiredText(value.explanation),
    fixExample:
      typeof value.fixExample === 'string'
        ? value.fixExample.slice(0, 4000)
        : null,
    remediationSteps: textArray(value.remediationSteps),
    risk: requiredText(value.risk),
    verificationSteps: textArray(value.verificationSteps),
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
  return {
    commitMessage: requiredText(value.commitMessage).slice(0, 500),
    proposedContent: requiredLongText(value.proposedContent, 200_000),
    summary: requiredText(value.summary),
    title: requiredText(value.title).slice(0, 255),
  };
}

function requiredLongText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string' || !value) {
    throw new Error('Missing AI fix content');
  }
  return value.slice(0, maxLength);
}
