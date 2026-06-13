import { FindingSeverity } from '@prisma/client';

import type { NormalizedFinding } from './finding-normalizer';

export function countSeverities(findings: NormalizedFinding[]) {
  return {
    criticalCount: findings.filter(
      (finding) => finding.severity === FindingSeverity.CRITICAL,
    ).length,
    highCount: findings.filter(
      (finding) => finding.severity === FindingSeverity.HIGH,
    ).length,
    infoCount: findings.filter(
      (finding) => finding.severity === FindingSeverity.INFO,
    ).length,
    lowCount: findings.filter(
      (finding) => finding.severity === FindingSeverity.LOW,
    ).length,
    mediumCount: findings.filter(
      (finding) => finding.severity === FindingSeverity.MEDIUM,
    ).length,
    totalFindings: findings.length,
  };
}
