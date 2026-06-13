import { Injectable, NotFoundException } from '@nestjs/common';
import { FindingSeverity, ScanStatus, type ScanLog } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type {
  ReportData,
  ReportFinding,
  ReportRiskLevel,
} from './types/report-data.type';

const disclaimer =
  'This report is generated from automated security scanners. Automated scanning helps identify potential risks, but it does not replace manual security review, secure code review, or penetration testing.';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReportData(userId: string, scanId: string): Promise<ReportData> {
    const scan = await this.prisma.scanJob.findFirst({
      include: {
        findings: {
          orderBy: { createdAt: 'asc' },
          select: {
            category: true,
            confidence: true,
            cwe: true,
            description: true,
            evidenceMasked: true,
            filePath: true,
            id: true,
            impact: true,
            lineEnd: true,
            lineStart: true,
            owasp: true,
            recommendation: true,
            scanner: true,
            severity: true,
            status: true,
            title: true,
          },
        },
        organization: { select: { id: true, name: true } },
        repository: {
          select: {
            defaultBranch: true,
            fullName: true,
            htmlUrl: true,
            id: true,
            name: true,
            provider: true,
          },
        },
        scanLogs: { orderBy: { createdAt: 'asc' } },
      },
      where: {
        id: scanId,
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
    if (!scan) throw new NotFoundException('Scan job not found');

    const report = await this.prisma.report.upsert({
      create: { scanJobId: scan.id },
      update: { generatedAt: new Date() },
      where: { scanJobId: scan.id },
    });
    const findings = scan.findings as ReportFinding[];
    const findingsBySeverity = groupFindings(findings, 'severity');
    const findingsByScanner = groupFindings(findings, 'scanner');
    const scanners = scannerSummary(scan.scanLogs, findings);

    return {
      disclaimer,
      findings,
      findingsByScanner,
      findingsBySeverity,
      metadata: {
        branch: scan.branch,
        commitSha: scan.commitSha,
        generatedAt: report.generatedAt.toISOString(),
        reportId: report.id,
        scanCreatedAt: scan.createdAt.toISOString(),
        scanFinishedAt: scan.finishedAt?.toISOString() ?? null,
        scanId: scan.id,
        scanStartedAt: scan.startedAt?.toISOString() ?? null,
        scanStatus: scan.status,
        triggerType: scan.triggerType,
      },
      organization: scan.organization,
      recommendations: recommendations(findings),
      repository: scan.repository,
      scannerSummary: scanners,
      scanLogsSummary: scan.scanLogs.slice(-20).map((log) => ({
        createdAt: log.createdAt.toISOString(),
        level: log.level,
        message: sanitizeLog(log.message),
      })),
      summary: {
        critical: scan.criticalCount,
        executiveSummary: executiveSummary(scan.status, scan.totalFindings),
        high: scan.highCount,
        info: scan.infoCount,
        low: scan.lowCount,
        medium: scan.mediumCount,
        riskLevel: riskLevel(scan.status, scan),
        scannerCount: scanners.length,
        totalFindings: scan.totalFindings,
      },
    };
  }

  async assertPdfAllowed(userId: string, scanId: string) {
    const scan = await this.prisma.scanJob.findFirst({
      select: { organizationId: true },
      where: {
        id: scanId,
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
    if (!scan) throw new NotFoundException('Scan job not found');
    const subscription = await this.prisma.subscription.findUnique({
      include: { plan: true },
      where: { organizationId: scan.organizationId },
    });
    const plan =
      subscription?.plan ??
      (await this.prisma.plan.findUnique({ where: { code: 'free' } }));
    if (plan && !plan.enablePdfReport)
      throw new NotFoundException(
        'PDF reports are not available on the current plan',
      );
  }
}

function groupFindings(
  findings: ReportFinding[],
  key: 'scanner' | 'severity',
): Record<string, ReportFinding[]> {
  return findings.reduce<Record<string, ReportFinding[]>>((groups, finding) => {
    const value = finding[key];
    groups[value] ??= [];
    groups[value].push(finding);
    return groups;
  }, {});
}

function executiveSummary(status: ScanStatus, totalFindings: number): string {
  if (status === ScanStatus.SUCCESS && totalFindings > 0) {
    return 'This scan detected potential security findings that should be reviewed and prioritized based on severity.';
  }
  if (status === ScanStatus.SUCCESS) {
    return 'No findings were detected by the enabled scanners. This does not guarantee the codebase is vulnerability-free.';
  }
  if (status === ScanStatus.FAILED) {
    return 'The scan did not complete successfully. Review scan logs before relying on this report.';
  }
  return 'The scan is not completed yet. Report data may be incomplete.';
}

function riskLevel(
  status: ScanStatus,
  counts: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
  },
): ReportRiskLevel {
  if (status === ScanStatus.FAILED) return 'UNKNOWN';
  if (counts.criticalCount > 0) return 'CRITICAL';
  if (counts.highCount > 0) return 'HIGH';
  if (counts.mediumCount > 0) return 'MEDIUM';
  if (counts.lowCount > 0) return 'LOW';
  return counts.infoCount > 0 ? 'INFO' : 'LOW';
}

function scannerSummary(logs: ScanLog[], findings: ReportFinding[]) {
  const coverage: Record<string, string> = {
    gitleaks: 'Secret leak detection',
    semgrep: 'SAST and source code pattern analysis',
    trivy: 'Dependency vulnerability and misconfiguration analysis',
  };
  const scanners = new Set(findings.map((finding) => finding.scanner));
  for (const scanner of Object.keys(coverage)) {
    if (logs.some((log) => log.message.toLowerCase().includes(scanner))) {
      scanners.add(scanner);
    }
  }
  return [...scanners].sort().map((scanner) => {
    const scannerLogs = logs.filter((log) =>
      log.message.toLowerCase().includes(scanner),
    );
    const failed = scannerLogs.some((log) =>
      log.message.toLowerCase().includes('failed'),
    );
    const completed = scannerLogs.some((log) =>
      log.message.toLowerCase().includes('completed'),
    );
    return {
      coverage: coverage[scanner] ?? 'Automated security analysis',
      scanner,
      status: failed ? 'failed' : completed ? 'completed' : 'started',
      total: findings.filter((finding) => finding.scanner === scanner).length,
    } as const;
  });
}

function recommendations(findings: ReportFinding[]): string[] {
  const values = [...findings]
    .sort(
      (left, right) =>
        severityOrder(left.severity) - severityOrder(right.severity),
    )
    .map((finding) => finding.recommendation)
    .filter((value): value is string => Boolean(value));
  return [...new Set(values)];
}

function severityOrder(severity: FindingSeverity): number {
  return ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'UNKNOWN'].indexOf(
    severity,
  );
}

function sanitizeLog(message: string): string {
  return message
    .replace(/https?:\/\/[^@\s]+@/gi, 'https://[credentials-hidden]@')
    .replace(/[A-Za-z0-9_-]{40,}/g, '[sensitive-value-hidden]')
    .slice(0, 500);
}
