import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryProvider } from '@prisma/client';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import { GitHubAppService } from '../github/github-app.service';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AppSettingsService } from '../settings/app-settings.service';
import type { CreateFixPullRequestDto } from './dto/create-fix-pull-request.dto';
import type { GenerateFindingFixDto } from './dto/generate-finding-fix.dto';
import type { ReviewFindingDto } from './dto/review-finding.dto';
import { GroqService } from './groq.service';

interface GitHubContentResponse {
  content: string;
  encoding: string;
  sha: string;
  size: number;
}

interface GitHubRefResponse {
  object: { sha: string };
}

interface GitHubPullRequestResponse {
  html_url: string;
  number: number;
}

@Injectable()
export class AiService {
  constructor(
    private readonly github: GitHubAppService,
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly settings: AppSettingsService,
  ) {}

  async reviewFinding(
    userId: string,
    findingId: string,
    dto: ReviewFindingDto,
  ) {
    const finding = await this.findFinding(userId, findingId);
    return this.groq.reviewFinding(this.findingContext(finding), dto.question);
  }

  async sourceFile(userId: string, findingId: string) {
    const finding = await this.findFinding(userId, findingId);
    const target = await this.writableTarget(finding);
    const content = await this.getContent(target);
    const maxBytes = this.settings.getNumber('AI_FIX_MAX_FILE_BYTES', 30_000);
    if (content.size > maxBytes) {
      throw new BadRequestException(
        `Source preview supports files up to ${maxBytes} bytes`,
      );
    }
    const decoded = decodeGitHubContent(content);
    assertNoLikelySecrets(decoded);
    return {
      branch: target.branch,
      content: decoded,
      filePath: target.filePath,
      sourceSha: content.sha,
    };
  }

  async generateFix(
    userId: string,
    findingId: string,
    dto: GenerateFindingFixDto,
  ) {
    const finding = await this.findFinding(userId, findingId, true);
    const target = await this.writableTarget(finding);
    const content = await this.getContent(target);
    const maxBytes = this.settings.getNumber('AI_FIX_MAX_FILE_BYTES', 30_000);
    if (content.size > maxBytes) {
      throw new BadRequestException(
        `AI fix supports files up to ${maxBytes} bytes`,
      );
    }
    const originalContent = decodeGitHubContent(content);
    assertNoLikelySecrets(originalContent);
    const generated = await this.groq.generateFix(
      `${this.findingContext(finding)}
The user explicitly requested a one-time fix proposal and allowed the complete target file to be sent to the configured AI provider.`,
      originalContent,
      dto.instruction,
    );
    if (generated.proposedContent === originalContent) {
      throw new BadRequestException('AI did not propose a code change');
    }
    return {
      ...generated,
      approvalToken: this.createApprovalToken(
        finding.id,
        content.sha,
        generated,
      ),
      originalContent,
      sourceSha: content.sha,
    };
  }

  async createFixPullRequest(
    userId: string,
    findingId: string,
    dto: CreateFixPullRequestDto,
  ) {
    if (!this.settings.getBoolean('AI_GITHUB_WRITE_ENABLED', false)) {
      throw new ConflictException('AI GitHub write automation is disabled');
    }
    const finding = await this.findFinding(userId, findingId, true);
    const target = await this.writableTarget(finding);
    const current = await this.getContent(target);
    if (current.sha !== dto.sourceSha) {
      throw new ConflictException(
        'The source file changed after this fix was generated. Generate a new proposal.',
      );
    }
    this.verifyApprovalToken(dto.approvalToken, finding.id, dto.sourceSha, dto);
    if (decodeGitHubContent(current) === dto.proposedContent) {
      throw new BadRequestException('Approved fix does not change the file');
    }

    const branch = `kodeye/ai-${finding.id.slice(0, 8)}-${Date.now().toString(36)}`;
    const baseRef = await this.github.installationRequest<GitHubRefResponse>(
      target.installationId,
      `/repos/${target.fullName}/git/ref/heads/${encodeURIComponent(target.branch)}`,
    );
    await this.github.installationRequest(
      target.installationId,
      `/repos/${target.fullName}/git/refs`,
      {
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: baseRef.object.sha,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    );
    await this.github.installationRequest(
      target.installationId,
      `/repos/${target.fullName}/contents/${encodePath(target.filePath)}`,
      {
        body: JSON.stringify({
          branch,
          content: Buffer.from(dto.proposedContent, 'utf8').toString('base64'),
          message: dto.commitMessage,
          sha: dto.sourceSha,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      },
    );
    const pullRequest =
      await this.github.installationRequest<GitHubPullRequestResponse>(
        target.installationId,
        `/repos/${target.fullName}/pulls`,
        {
          body: JSON.stringify({
            base: target.branch,
            body: [
              'Automated fix proposed by Kodeye AI after explicit user approval.',
              '',
              `Finding: ${finding.title}`,
              `Severity: ${finding.severity}`,
              `CWE: ${finding.cwe ?? 'not provided'}`,
              '',
              'Kodeye will scan this pull request through the configured GitHub webhook automation.',
            ].join('\n'),
            head: branch,
            title: dto.title,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );
    return {
      branch,
      pullRequestNumber: pullRequest.number,
      pullRequestUrl: pullRequest.html_url,
    };
  }

  private async findFinding(
    userId: string,
    findingId: string,
    ownerOnly = false,
  ) {
    const finding = await this.prisma.finding.findFirst({
      include: { scanJob: { include: { repository: true } } },
      where: {
        id: findingId,
        scanJob: {
          organization: ownerOnly
            ? { ownerUserId: userId }
            : {
                OR: [
                  { ownerUserId: userId },
                  { members: { some: { userId } } },
                ],
              },
        },
      },
    });
    if (!finding) throw new NotFoundException('Finding not found');
    return finding;
  }

  private findingContext(finding: FindingDetail) {
    return [
      'Sanitized security finding:',
      `Title: ${redactSecrets(finding.title)}`,
      `Category: ${finding.category}`,
      `Severity: ${finding.severity}`,
      `Scanner confidence: ${finding.confidence}`,
      `Scanner: ${finding.scanner}`,
      `CWE: ${redactSecrets(finding.cwe ?? 'not provided')}`,
      `OWASP: ${redactSecrets(finding.owasp ?? 'not provided')}`,
      `Location: ${redactSecrets(finding.filePath ?? 'not provided')}${finding.lineStart ? `:${finding.lineStart}${finding.lineEnd ? `-${finding.lineEnd}` : ''}` : ''}`,
      `Description: ${redactSecrets(finding.description ?? 'not provided')}`,
      `Impact: ${redactSecrets(finding.impact ?? 'not provided')}`,
      `Existing recommendation: ${redactSecrets(finding.recommendation ?? 'not provided')}`,
      'No secret evidence is included.',
    ].join('\n');
  }

  private async writableTarget(finding: FindingDetail) {
    const repository = finding.scanJob.repository;
    if (
      repository.provider !== RepositoryProvider.GITHUB ||
      !repository.fullName ||
      !repository.isConnected
    ) {
      throw new BadRequestException(
        'AI fixes require a connected GitHub repository',
      );
    }
    if (!finding.filePath || isBlockedPath(finding.filePath)) {
      throw new BadRequestException(
        'This finding cannot be fixed automatically because it has no safe writable source file target. Use AI review for remediation guidance, or apply the fix manually.',
      );
    }
    const installation = await this.prisma.gitHubInstallation.findFirst({
      where: { organizationId: finding.scanJob.organizationId },
    });
    if (!installation)
      throw new NotFoundException('GitHub installation not found');
    return {
      branch: finding.scanJob.branch ?? repository.defaultBranch,
      filePath: finding.filePath,
      fullName: repository.fullName,
      installationId: installation.installationId,
    };
  }

  private getContent(target: Awaited<ReturnType<AiService['writableTarget']>>) {
    return this.github.installationRequest<GitHubContentResponse>(
      target.installationId,
      `/repos/${target.fullName}/contents/${encodePath(target.filePath)}?ref=${encodeURIComponent(target.branch)}`,
    );
  }

  private createApprovalToken(
    findingId: string,
    sourceSha: string,
    proposal: {
      commitMessage: string;
      patch: string;
      proposedContent: string;
      title: string;
    },
  ) {
    const payload = Buffer.from(
      JSON.stringify({
        exp: Date.now() + 30 * 60 * 1000,
        findingId,
        proposedHash: proposalHash(proposal),
        sourceSha,
      }),
    ).toString('base64url');
    return `${payload}.${this.sign(payload)}`;
  }

  private verifyApprovalToken(
    token: string,
    findingId: string,
    sourceSha: string,
    proposal: {
      commitMessage: string;
      patch: string;
      proposedContent: string;
      title: string;
    },
  ) {
    const [payload, signature] = token.split('.');
    if (!payload || !signature || !safeEqual(signature, this.sign(payload))) {
      throw new BadRequestException('Invalid AI fix approval token');
    }
    try {
      const value = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as {
        exp?: number;
        findingId?: string;
        proposedHash?: string;
        sourceSha?: string;
      };
      if (
        !value.exp ||
        value.exp < Date.now() ||
        value.findingId !== findingId ||
        value.sourceSha !== sourceSha ||
        value.proposedHash !== proposalHash(proposal)
      ) {
        throw new Error();
      }
    } catch {
      throw new BadRequestException(
        'AI fix approval expired or does not match the proposal',
      );
    }
  }

  private sign(payload: string) {
    return createHmac('sha256', this.settings.getOrThrow('JWT_SECRET'))
      .update(payload)
      .digest('base64url');
  }
}

type FindingDetail = Awaited<ReturnType<AiService['findFinding']>>;

function decodeGitHubContent(content: GitHubContentResponse): string {
  if (content.encoding !== 'base64') {
    throw new BadRequestException(
      'GitHub returned an unsupported file encoding',
    );
  }
  return Buffer.from(content.content.replace(/\s/g, ''), 'base64').toString(
    'utf8',
  );
}

function encodePath(filePath: string): string {
  return filePath.split('/').map(encodeURIComponent).join('/');
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

function assertNoLikelySecrets(content: string) {
  if (
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(content) ||
    /\b(?:AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/.test(
      content,
    ) ||
    /\b(?:password|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]/i.test(
      content,
    )
  ) {
    throw new BadRequestException(
      'AI fix was blocked because the target file may contain a credential or private key',
    );
  }
}

function hash(value: string) {
  return createHash('sha256').update(value).digest('base64url');
}

function proposalHash(proposal: {
  commitMessage: string;
  patch: string;
  proposedContent: string;
  title: string;
}) {
  return hash(
    JSON.stringify({
      commitMessage: proposal.commitMessage,
      patch: proposal.patch,
      proposedContent: proposal.proposedContent,
      title: proposal.title,
    }),
  );
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
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
