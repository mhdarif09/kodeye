import {
  RepositoryProvider,
  ScanStatus,
  type PrismaClient,
  type ScanJob,
} from '@prisma/client';

import { removeDirectory, safeChildPath } from '../common/filesystem';
import type { WorkerEnvironment } from '../config/env';
import { GitHubAppTokenService } from '../github/github-app-token.service';
import { GitHubInstallationTokenService } from '../github/github-installation-token.service';
import { GitHubChecksService } from '../github/github-checks.service';
import {
  normalizeScannerOutput,
  type NormalizedFinding,
} from './finding-normalizer';
import { BUG_BOUNTY_CATALOG_VERSION } from './bug-bounty-classifier';
import { inspectAuditScope } from './audit-scope';
import {
  cloneGitHubRepository,
  clonePublicGitHubRepository,
} from './github-repository-cloner';
import { runScanner, type ScannerName } from './scanner-runner';
import { countSeverities } from './severity-counter';

const disabledMessage =
  'Scanner execution is disabled. Enable Dockerized worker or set SCANNER_EXECUTION_MODE=local-cli.';

export class ScanProcessor {
  private readonly installationTokenService: GitHubInstallationTokenService;
  private readonly checksService: GitHubChecksService;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly environment: WorkerEnvironment,
  ) {
    this.installationTokenService = new GitHubInstallationTokenService(
      new GitHubAppTokenService(environment),
    );
    this.checksService = new GitHubChecksService(
      this.installationTokenService,
      environment,
    );
  }

  async process(scan: ScanJob) {
    const repositoryPath = safeChildPath(this.environment.tempDir, scan.id);
    await this.log(scan.id, 'info', 'scan started');
    try {
      if (this.environment.scannerExecutionMode === 'disabled') {
        throw new Error(disabledMessage);
      }

      const detail = await this.prisma.scanJob.findUnique({
        include: { repository: true },
        where: { id: scan.id },
      });
      if (!detail) throw new Error('Scan job not found');
      let installationId: string | null = null;
      if (detail.repository.provider === RepositoryProvider.GITHUB) {
        if (!detail.repository.fullName) {
          throw new Error('GitHub repository full name is missing');
        }
        await this.log(scan.id, 'info', 'finding github installation');
        const installation = await this.prisma.gitHubInstallation.findFirst({
          where: { organizationId: detail.organizationId },
        });
        if (!installation) {
          throw new Error(
            'GitHub installation not found for this organization.',
          );
        }
        installationId = installation.installationId;
        await this.updateCheck(detail, installationId, {
          status: 'in_progress',
          summary:
            'Kodeye is analyzing this commit for potential security findings.',
        });

        await this.log(scan.id, 'info', 'generating installation token');
        const installationToken =
          await this.installationTokenService.createToken(installationId);
        await this.log(
          scan.id,
          'info',
          `cloning repository ${detail.repository.fullName}`,
        );
        await cloneGitHubRepository({
          branch: detail.branch ?? detail.repository.defaultBranch,
          fullName: detail.repository.fullName,
          installationToken,
          jobId: scan.id,
          tempDir: this.environment.tempDir,
          timeoutMs: this.environment.scannerTimeoutMs,
        });
      } else {
        if (!detail.repository.repoUrl || detail.repository.isPrivate) {
          throw new Error(
            'Manual scan requires a public GitHub repository URL',
          );
        }
        await this.log(
          scan.id,
          'info',
          `cloning public repository ${detail.repository.repoUrl}`,
        );
        await clonePublicGitHubRepository({
          branch: detail.branch ?? detail.repository.defaultBranch,
          jobId: scan.id,
          repoUrl: detail.repository.repoUrl,
          tempDir: this.environment.tempDir,
          timeoutMs: this.environment.scannerTimeoutMs,
        });
      }
      await this.log(scan.id, 'success', 'clone completed');
      const scope = await inspectAuditScope(repositoryPath);
      await this.log(
        scan.id,
        scope.truncated ? 'warn' : 'info',
        `full working-tree audit scope: ${scope.files} files across ${scope.directories} directories; top extensions: ${scope.topExtensions.join(', ') || 'none'}${scope.truncated ? ' (inventory truncated)' : ''}`,
      );
      await this.log(
        scan.id,
        'info',
        `top audited folders: ${scope.topDirectories.join(', ') || 'repository root only'}`,
      );
      await this.log(
        scan.id,
        'info',
        `bug-bounty classification catalog: ${BUG_BOUNTY_CATALOG_VERSION}`,
      );

      const allFindings: NormalizedFinding[] = [];
      let successfulScanners = 0;
      for (const scanner of [
        'code-quality',
        'semgrep',
        'codeql',
        'gitleaks',
        'trivy',
      ] as ScannerName[]) {
        await this.log(scan.id, 'info', `${scanner} started`);
        const result = await runScanner(
          scanner,
          repositoryPath,
          this.environment,
        );
        if (!result.success) {
          await this.log(
            scan.id,
            'warn',
            `${scanner} failed with ${result.warning ?? 'unknown scanner error'}`,
          );
          continue;
        }
        successfulScanners += 1;
        const findings = normalizeScannerOutput(
          scanner,
          result.output,
          this.environment.storeCodeEvidence,
        );
        allFindings.push(...findings);
        await this.log(
          scan.id,
          result.warning ? 'warn' : 'success',
          `${scanner} completed with ${findings.length} findings${
            result.warning ? ` (${result.warning})` : ''
          }`,
        );
      }

      if (successfulScanners === 0) {
        throw new Error('All configured scanners failed');
      }

      await this.log(scan.id, 'info', 'normalizing findings');
      await this.log(scan.id, 'info', 'saving findings');
      await this.saveFindings(scan.id, allFindings);
      await this.log(
        scan.id,
        'success',
        `findings saved (${allFindings.length})`,
      );
      const counts = countSeverities(allFindings);
      await this.prisma.scanJob.update({
        data: {
          ...counts,
          errorMessage: null,
          finishedAt: new Date(),
          status: ScanStatus.SUCCESS,
        },
        where: { id: scan.id },
      });
      await this.log(scan.id, 'success', 'scan completed');
      if (installationId) {
        await this.updateCheck(detail, installationId, {
          conclusion:
            counts.criticalCount > 0 || counts.highCount > 0
              ? 'failure'
              : 'success',
          status: 'completed',
          summary:
            counts.criticalCount > 0 || counts.highCount > 0
              ? 'Kodeye detected high-risk findings. Review the scan report before merging.'
              : allFindings.length === 0
                ? 'No findings detected by enabled scanners.'
                : 'Kodeye completed the scan. Review findings for details.',
        });
      }
    } catch (error) {
      const message = safeErrorMessage(error);
      await this.fail(scan.id, message);
      await this.updateFailedCheck(scan.id);
    } finally {
      try {
        await removeDirectory(repositoryPath);
        await this.log(scan.id, 'success', 'cleanup completed');
      } catch {
        await this.log(scan.id, 'warn', 'cleanup failed');
      }
    }
  }

  private async saveFindings(scanJobId: string, findings: NormalizedFinding[]) {
    const operations = [
      this.prisma.finding.deleteMany({ where: { scanJobId } }),
    ];
    for (let index = 0; index < findings.length; index += 500) {
      operations.push(
        this.prisma.finding.createMany({
          data: findings
            .slice(index, index + 500)
            .map((finding) => ({ ...finding, scanJobId })),
        }),
      );
    }
    await this.prisma.$transaction(operations);
  }

  private async fail(scanJobId: string, errorMessage: string) {
    await this.prisma.$transaction([
      this.prisma.scanLog.create({
        data: {
          level: 'error',
          message: `scan failed: ${errorMessage}`,
          scanJobId,
        },
      }),
      this.prisma.scanJob.update({
        data: {
          errorMessage,
          finishedAt: new Date(),
          status: ScanStatus.FAILED,
        },
        where: { id: scanJobId },
      }),
    ]);
  }

  private log(scanJobId: string, level: string, message: string) {
    return this.prisma.scanLog.create({
      data: { level, message, scanJobId },
    });
  }

  private async updateFailedCheck(scanJobId: string) {
    const detail = await this.prisma.scanJob.findUnique({
      include: { repository: true },
      where: { id: scanJobId },
    });
    if (!detail) return;
    const installation = await this.prisma.gitHubInstallation.findFirst({
      where: { organizationId: detail.organizationId },
    });
    if (!installation) return;
    await this.updateCheck(detail, installation.installationId, {
      conclusion: 'failure',
      status: 'completed',
      summary: 'Kodeye scan failed. Review scan logs.',
    });
  }

  private async updateCheck(
    scan: ScanJob & { repository: { fullName: string | null } },
    installationId: string,
    input: {
      conclusion?: 'failure' | 'success';
      status: 'completed' | 'in_progress';
      summary: string;
    },
  ) {
    if (!scan.githubCheckRunId || !scan.repository.fullName) return;
    try {
      await this.checksService.update(
        installationId,
        scan.repository.fullName,
        scan.githubCheckRunId,
        scan.id,
        input,
      );
    } catch {
      await this.log(
        scan.id,
        'warn',
        'GitHub Check Run update failed. Scan processing continued.',
      );
    }
  }
}

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown scan error';
  return message
    .replace(/(bearer\s+)[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/([?&](?:token|secret|key|password)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/(https?:\/\/[^:/\s]+:)[^@\s]+(@)/gi, '$1[REDACTED]$2')
    .slice(0, 500);
}
