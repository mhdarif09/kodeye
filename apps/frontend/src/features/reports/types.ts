import type {
  Finding,
  FindingSeverity,
  ScanJob,
  ScanStatus,
} from '../scans/types';

export type ReportRiskLevel =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFO'
  | 'UNKNOWN';

export interface ReportData {
  metadata: {
    reportId: string;
    generatedAt: string;
    scanId: string;
    scanStatus: ScanStatus;
    scanCreatedAt: string;
    scanStartedAt: string | null;
    scanFinishedAt: string | null;
    triggerType: ScanJob['triggerType'];
    branch: string | null;
    commitSha: string | null;
  };
  repository: {
    id: string;
    name: string;
    fullName: string | null;
    provider: 'MANUAL' | 'GITHUB';
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
  findings: Finding[];
  findingsBySeverity: Partial<Record<FindingSeverity, Finding[]>>;
  findingsByScanner: Record<string, Finding[]>;
  recommendations: string[];
  scanLogsSummary: Array<{
    level: string;
    message: string;
    createdAt: string;
  }>;
  disclaimer: string;
}
