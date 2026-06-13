import type { Repository } from '../repositories/types';

export type ScanStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELED';
export type FindingSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFO'
  | 'UNKNOWN';

export interface ScanJob {
  id: string;
  repositoryId: string;
  organizationId: string;
  triggeredByUserId: string | null;
  triggerType: 'MANUAL' | 'GITHUB_SYNC' | 'GITHUB_PUSH' | 'GITHUB_PULL_REQUEST';
  branch: string | null;
  commitSha: string | null;
  pullRequestNumber: number | null;
  githubCheckRunId: string | null;
  githubCheckUrl: string | null;
  webhookDeliveryId: string | null;
  status: ScanStatus;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  createdAt: string;
  updatedAt: string;
  repository: Pick<
    Repository,
    'id' | 'name' | 'fullName' | 'provider' | 'defaultBranch'
  >;
  organization?: { id: string; name: string };
}

export interface Finding {
  id: string;
  scanner: string;
  category: string;
  title: string;
  description: string | null;
  severity: FindingSeverity;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  filePath: string | null;
  lineStart: number | null;
  lineEnd: number | null;
  evidenceMasked: string | null;
  cwe: string | null;
  owasp: string | null;
  impact: string | null;
  recommendation: string | null;
  status: 'OPEN' | 'IGNORED' | 'FIXED' | 'FALSE_POSITIVE';
  createdAt: string;
  updatedAt: string;
}

export interface ScanLog {
  id: string;
  scanJobId: string;
  level: string;
  message: string;
  createdAt: string;
}

export interface ScanQuery {
  organizationId?: string;
  repositoryId?: string;
  status?: ScanStatus;
}

export interface FindingQuery {
  severity?: FindingSeverity;
  scanner?: string;
  status?: Finding['status'];
}
