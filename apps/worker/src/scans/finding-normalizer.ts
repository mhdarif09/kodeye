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
  impact?: string;
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
    impact:
      'Exposed credentials can allow unauthorized access to systems, data, or third-party services.',
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
  const cwe = metadataText(metadata.cwe);
  return {
    category: metadataText(metadata.category) ?? 'SAST',
    confidence: FindingConfidence.UNKNOWN,
    cwe,
    description: message,
    evidenceMasked: safeCodeEvidence(text(extra.lines)),
    filePath: text(raw.path),
    lineEnd: numberValue(recordValue(raw.end).line),
    lineStart: numberValue(recordValue(raw.start).line),
    impact: metadataText(metadata.impact),
    owasp: metadataText(metadata.owasp) ?? inferOwasp(cwe),
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
    for (const secret of arrayValue(result.Secrets)) {
      findings.push(normalizeTrivySecret(recordValue(secret), target));
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
  const cwe = arrayText(raw.CweIDs);
  return {
    category: 'Dependency Vulnerability',
    confidence: FindingConfidence.UNKNOWN,
    cwe,
    description: truncate(text(raw.Description)),
    filePath: target,
    impact:
      'A vulnerable dependency may expose the application to known attacks when the affected code path is reachable.',
    owasp: inferOwasp(cwe),
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
    impact:
      'Insecure configuration can expose services, data, or deployment infrastructure.',
    lineEnd: numberValue(cause.EndLine),
    lineStart: numberValue(cause.StartLine),
    owasp: 'OWASP Top 10 2021 A05: Security Misconfiguration',
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

function normalizeTrivySecret(
  raw: Record<string, unknown>,
  target?: string,
): NormalizedFinding {
  const secret = text(raw.Match) ?? text(raw.Code) ?? '';
  return {
    category: 'Secret Leak',
    confidence: FindingConfidence.HIGH,
    description:
      'Trivy detected a potential credential or secret in the repository.',
    evidenceMasked: maskSecret(secret),
    filePath: target,
    impact:
      'Exposed credentials can allow unauthorized access to systems, data, or third-party services.',
    lineEnd: numberValue(raw.EndLine),
    lineStart: numberValue(raw.StartLine),
    owasp: 'OWASP Top 10 2021 A02: Cryptographic Failures',
    rawJson: {
      Category: text(raw.Category) ?? '',
      RuleID: text(raw.RuleID) ?? '',
      Severity: text(raw.Severity) ?? 'UNKNOWN',
      Target: target ?? '',
    },
    recommendation:
      'Rotate the exposed credential, remove it from source control, and use a secret manager or environment variable.',
    scanner: 'trivy',
    severity: trivySeverity(text(raw.Severity)),
    status: FindingStatus.OPEN,
    title: text(raw.Title) ?? text(raw.RuleID) ?? 'Potential leaked secret',
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

function inferOwasp(cwe?: string): string | undefined {
  if (!cwe) return undefined;
  const mappings: Array<[RegExp, string]> = [
    [
      /CWE-(22|23|35|59|200|201|219|264|284|285|352|639)/i,
      'OWASP Top 10 2021 A01: Broken Access Control',
    ],
    [
      /CWE-(261|310|311|312|319|321|322|323|324|325|326|327|328|329|330|331|798)/i,
      'OWASP Top 10 2021 A02: Cryptographic Failures',
    ],
    [
      /CWE-(74|77|78|79|80|83|87|88|89|90|91|93|94|95|96|97|564|917)/i,
      'OWASP Top 10 2021 A03: Injection',
    ],
    [
      /CWE-(16|209|611|614|756|942|1004)/i,
      'OWASP Top 10 2021 A05: Security Misconfiguration',
    ],
    [
      /CWE-(287|288|290|294|295|297|300|302|304|306|307|308|384|521|613|620)/i,
      'OWASP Top 10 2021 A07: Identification and Authentication Failures',
    ],
    [
      /CWE-(345|353|426|494|502|565|829)/i,
      'OWASP Top 10 2021 A08: Software and Data Integrity Failures',
    ],
    [
      /CWE-(117|223|532|778)/i,
      'OWASP Top 10 2021 A09: Security Logging and Monitoring Failures',
    ],
    [/CWE-918/i, 'OWASP Top 10 2021 A10: Server-Side Request Forgery'],
  ];
  return mappings.find(([pattern]) => pattern.test(cwe))?.[1];
}

function clampFinding(finding: NormalizedFinding): NormalizedFinding {
  return {
    ...finding,
    category: finding.category.slice(0, 255),
    cwe: finding.cwe?.slice(0, 100),
    evidenceMasked: finding.evidenceMasked?.slice(0, MAX_TEXT),
    filePath: finding.filePath?.slice(0, 2048),
    impact: finding.impact?.slice(0, MAX_TEXT),
    owasp: finding.owasp?.slice(0, 255),
    scanner: finding.scanner.slice(0, 100),
    title: finding.title.slice(0, 500),
  };
}
