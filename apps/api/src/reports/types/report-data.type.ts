import type {
  FindingConfidence,
  FindingSeverity,
  FindingStatus,
  RepositoryProvider,
  ScanStatus,
  ScanTriggerType,
} from '@prisma/client';

export type ReportRiskLevel =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFO'
  | 'UNKNOWN';

export interface ReportFinding {
  id: string;
  scanner: string;
  category: string;
  title: string;
  description: string | null;
  severity: FindingSeverity;
  confidence: FindingConfidence;
  filePath: string | null;
  lineStart: number | null;
  lineEnd: number | null;
  evidenceMasked: string | null;
  cwe: string | null;
  owasp: string | null;
  impact: string | null;
  recommendation: string | null;
  status: FindingStatus;
}

export interface ReportData {
  metadata: {
    reportId: string;
    generatedAt: string;
    scanId: string;
    scanStatus: ScanStatus;
    scanCreatedAt: string;
    scanStartedAt: string | null;
    scanFinishedAt: string | null;
    triggerType: ScanTriggerType;
    branch: string | null;
    commitSha: string | null;
  };
  repository: {
    id: string;
    name: string;
    fullName: string | null;
    provider: RepositoryProvider;
    defaultBranch: string;
    htmlUrl: string | null;
  };
  organization: { id: string; name: string };
  summary: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    riskLevel: ReportRiskLevel;
    scannerCount: number;
    executiveSummary: string;
  };
  scannerSummary: Array<{
    scanner: string;
    total: number;
    status: 'completed' | 'failed' | 'started';
    coverage: string;
  }>;
  findings: ReportFinding[];
  findingsBySeverity: Record<string, ReportFinding[]>;
  findingsByScanner: Record<string, ReportFinding[]>;
  recommendations: string[];
  scanLogsSummary: Array<{
    level: string;
    message: string;
    createdAt: string;
  }>;
  disclaimer: string;
}
