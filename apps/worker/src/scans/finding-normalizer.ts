import {
  FindingConfidence,
  FindingSeverity,
  FindingStatus,
  type Prisma,
} from '@prisma/client';

import { arrayValue, recordValue } from '../common/safe-json';
import { maskSecret, safeCodeEvidence } from './secret-masker';
import type { ScannerName } from './scanner-runner';

const MAX_TEXT = 4000;

export interface NormalizedFinding {
  category: string;
  confidence: FindingConfidence;
  cwe?: string;
  description?: string;
  evidenceMasked?: string;
  filePath?: string;
  lineEnd?: number;
  lineStart?: number;
  owasp?: string;
  rawJson?: Prisma.InputJsonValue;
  recommendation?: string;
  scanner: string;
  severity: FindingSeverity;
  status: FindingStatus;
  title: string;
}

export function normalizeScannerOutput(
  scanner: ScannerName,
  output: unknown,
): NormalizedFinding[] {
  let findings: NormalizedFinding[];
  if (scanner === 'semgrep') {
    findings = arrayValue(recordValue(output).results).map((item) =>
      normalizeSemgrepFinding(recordValue(item)),
    );
  } else if (scanner === 'gitleaks') {
    findings = arrayValue(output).map((item) =>
      normalizeGitleaksFinding(recordValue(item)),
    );
  } else {
    findings = normalizeTrivyOutput(output);
  }
  return findings.map(clampFinding);
}

function normalizeGitleaksFinding(
  raw: Record<string, unknown>,
): NormalizedFinding {
  const secret = text(raw.Secret) ?? text(raw.Match) ?? '';
  return {
    category: 'Secret Leak',
    confidence: FindingConfidence.HIGH,
    description: 'A potential secret was detected in the repository.',
    evidenceMasked: maskSecret(secret),
    filePath: text(raw.File),
    lineEnd: numberValue(raw.EndLine),
    lineStart: numberValue(raw.StartLine),
    rawJson: {
      Description: text(raw.Description) ?? '',
      File: text(raw.File) ?? '',
      Match: secret ? maskSecret(secret) : '',
      RuleID: text(raw.RuleID) ?? '',
      Secret: secret ? maskSecret(secret) : '',
    },
    recommendation:
      'Rotate the exposed secret, remove it from git history, and store it using environment variables or a secret manager.',
    scanner: 'gitleaks',
    severity: FindingSeverity.CRITICAL,
    status: FindingStatus.OPEN,
    title:
      text(raw.Description) ?? text(raw.RuleID) ?? 'Potential leaked secret',
  };
}

function normalizeSemgrepFinding(
  raw: Record<string, unknown>,
): NormalizedFinding {
  const extra = recordValue(raw.extra);
  const metadata = recordValue(extra.metadata);
  const severity = text(extra.severity);
  const message = text(extra.message);
  return {
    category: metadataText(metadata.category) ?? 'SAST',
    confidence: FindingConfidence.UNKNOWN,
    cwe: metadataText(metadata.cwe),
    description: message,
    evidenceMasked: safeCodeEvidence(text(extra.lines)),
    filePath: text(raw.path),
    lineEnd: numberValue(recordValue(raw.end).line),
    lineStart: numberValue(recordValue(raw.start).line),
    owasp: metadataText(metadata.owasp),
    rawJson: {
      check_id: text(raw.check_id) ?? '',
      path: text(raw.path) ?? '',
      severity: severity ?? 'UNKNOWN',
    },
    recommendation:
      metadataText(metadata.fix) ?? metadataText(metadata.recommendation),
    scanner: 'semgrep',
    severity: semgrepSeverity(severity),
    status: FindingStatus.OPEN,
    title: message ?? text(raw.check_id) ?? 'Potential code risk',
  };
}

function normalizeTrivyOutput(output: unknown): NormalizedFinding[] {
  const findings: NormalizedFinding[] = [];
  for (const resultValue of arrayValue(recordValue(output).Results)) {
    const result = recordValue(resultValue);
    const target = text(result.Target);
    for (const vulnerability of arrayValue(result.Vulnerabilities)) {
      findings.push(
        normalizeTrivyVulnerability(recordValue(vulnerability), target),
      );
    }
    for (const misconfiguration of arrayValue(result.Misconfigurations)) {
      findings.push(
        normalizeTrivyMisconfiguration(recordValue(misconfiguration), target),
      );
    }
  }
  return findings;
}

function normalizeTrivyVulnerability(
  raw: Record<string, unknown>,
  target?: string,
): NormalizedFinding {
  const fixedVersion = text(raw.FixedVersion);
  const vulnerabilityId = text(raw.VulnerabilityID) ?? 'Unknown vulnerability';
  const packageName = text(raw.PkgName);
  return {
    category: 'Dependency Vulnerability',
    confidence: FindingConfidence.UNKNOWN,
    cwe: arrayText(raw.CweIDs),
    description: truncate(text(raw.Description)),
    filePath: target,
    rawJson: sanitizeTrivyRaw(raw, target),
    recommendation: fixedVersion
      ? `Upgrade package to fixed version: ${fixedVersion}`
      : (text(raw.PrimaryURL) ??
        'Review the dependency and apply the vendor-recommended fix.'),
    scanner: 'trivy',
    severity: trivySeverity(text(raw.Severity)),
    status: FindingStatus.OPEN,
    title: `${vulnerabilityId}${packageName ? ` in ${packageName}` : ''}`,
  };
}

function normalizeTrivyMisconfiguration(
  raw: Record<string, unknown>,
  target?: string,
): NormalizedFinding {
  const cause = recordValue(raw.CauseMetadata);
  return {
    category: 'Misconfiguration',
    confidence: FindingConfidence.UNKNOWN,
    description: truncate(text(raw.Description)),
    filePath: target,
    lineEnd: numberValue(cause.EndLine),
    lineStart: numberValue(cause.StartLine),
    rawJson: sanitizeTrivyRaw(raw, target),
    recommendation:
      text(raw.Resolution) ??
      'Review the configuration and apply the vendor-recommended fix.',
    scanner: 'trivy',
    severity: trivySeverity(text(raw.Severity)),
    status: FindingStatus.OPEN,
    title: text(raw.Title) ?? text(raw.ID) ?? 'Potential misconfiguration',
  };
}

function sanitizeTrivyRaw(
  raw: Record<string, unknown>,
  target?: string,
): Prisma.InputJsonValue {
  return {
    ID: text(raw.VulnerabilityID) ?? text(raw.ID) ?? 'unknown',
    Package: text(raw.PkgName) ?? '',
    Severity: text(raw.Severity) ?? 'UNKNOWN',
    Target: target ?? '',
  };
}

function semgrepSeverity(value?: string): FindingSeverity {
  if (value === 'ERROR') return FindingSeverity.HIGH;
  if (value === 'WARNING') return FindingSeverity.MEDIUM;
  if (value === 'INFO') return FindingSeverity.INFO;
  return FindingSeverity.UNKNOWN;
}

function trivySeverity(value?: string): FindingSeverity {
  return Object.values(FindingSeverity).includes(value as FindingSeverity)
    ? (value as FindingSeverity)
    : FindingSeverity.UNKNOWN;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function truncate(value?: string): string | undefined {
  return value?.slice(0, MAX_TEXT);
}

function metadataText(value: unknown): string | undefined {
  if (Array.isArray(value))
    return value.map(String).join(', ').slice(0, MAX_TEXT);
  return truncate(text(value));
}

function arrayText(value: unknown): string | undefined {
  return Array.isArray(value)
    ? value.map(String).join(', ').slice(0, 100)
    : undefined;
}

function clampFinding(finding: NormalizedFinding): NormalizedFinding {
  return {
    ...finding,
    category: finding.category.slice(0, 255),
    cwe: finding.cwe?.slice(0, 100),
    evidenceMasked: finding.evidenceMasked?.slice(0, MAX_TEXT),
    filePath: finding.filePath?.slice(0, 2048),
    owasp: finding.owasp?.slice(0, 255),
    scanner: finding.scanner.slice(0, 100),
    title: finding.title.slice(0, 500),
  };
}
