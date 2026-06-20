import {
  FindingConfidence,
  FindingSeverity,
  FindingStatus,
  type Prisma,
} from '@prisma/client';

import { arrayValue, recordValue } from '../common/safe-json';
import { classifyBugBountyFinding } from './bug-bounty-classifier';
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
  storeCodeEvidence = false,
): NormalizedFinding[] {
  let findings: NormalizedFinding[];
  if (scanner === 'code-quality') {
    findings = arrayValue(recordValue(output).results).map((item) =>
      normalizeCodeQualityFinding(recordValue(item)),
    );
  } else if (scanner === 'codeql') {
    findings = normalizeCodeQlOutput(output);
  } else if (scanner === 'semgrep') {
    findings = arrayValue(recordValue(output).results).map((item) =>
      normalizeSemgrepFinding(recordValue(item), storeCodeEvidence),
    );
  } else if (scanner === 'gitleaks') {
    findings = arrayValue(output).map((item) =>
      normalizeGitleaksFinding(recordValue(item)),
    );
  } else {
    findings = normalizeTrivyOutput(output);
  }
  return findings.map(classifyBugBountyFinding).map(clampFinding);
}

function normalizeCodeQlOutput(output: unknown): NormalizedFinding[] {
  const findings: NormalizedFinding[] = [];
  for (const runValue of arrayValue(recordValue(output).runs)) {
    const run = recordValue(runValue);
    const driver = recordValue(recordValue(run.tool).driver);
    const rules = new Map<string, Record<string, unknown>>();
    for (const ruleValue of arrayValue(driver.rules)) {
      const rule = recordValue(ruleValue);
      const id = text(rule.id);
      if (id) rules.set(id, rule);
    }
    for (const resultValue of arrayValue(run.results)) {
      const result = recordValue(resultValue);
      const ruleId = text(result.ruleId);
      const rule = ruleId ? rules.get(ruleId) : undefined;
      findings.push(normalizeCodeQlFinding(result, rule));
    }
  }
  return findings;
}

function normalizeCodeQlFinding(
  result: Record<string, unknown>,
  rule?: Record<string, unknown>,
): NormalizedFinding {
  const location = recordValue(arrayValue(result.locations)[0]);
  const physicalLocation = recordValue(location.physicalLocation);
  const region = recordValue(physicalLocation.region);
  const artifact = recordValue(physicalLocation.artifactLocation);
  const properties = recordValue(rule?.properties);
  const tags = arrayText(properties.tags);
  const precision = text(properties.precision);
  const securitySeverity = Number(text(properties.securitySeverity));
  const ruleId = text(result.ruleId) ?? text(rule?.id);
  const message =
    text(recordValue(result.message).text) ??
    text(recordValue(rule?.fullDescription).text) ??
    text(recordValue(rule?.shortDescription).text);
  const cwe = tags
    ?.match(/external\/cwe\/cwe-\d+/i)?.[0]
    ?.replace(/external\/cwe\/cwe-/i, 'CWE-');
  return {
    category: inferCategory(ruleId) ?? 'CodeQL',
    confidence: codeQlConfidence(precision),
    cwe,
    description: truncate(message),
    filePath: text(artifact.uri),
    impact: codeQlImpact(securitySeverity, tags),
    lineEnd: numberValue(region.endLine),
    lineStart: numberValue(region.startLine),
    owasp: inferOwasp(cwe),
    rawJson: {
      precision: precision ?? '',
      ruleId: ruleId ?? '',
      securitySeverity: Number.isFinite(securitySeverity)
        ? String(securitySeverity)
        : '',
      tags: tags ?? '',
    },
    recommendation:
      text(recordValue(rule?.help).text) ??
      'Review the CodeQL alert path, apply the recommended secure coding pattern, and add regression coverage.',
    scanner: 'codeql',
    severity: codeQlSeverity(securitySeverity, text(result.level)),
    status: FindingStatus.OPEN,
    title:
      text(recordValue(rule?.shortDescription).text) ??
      message ??
      ruleId ??
      'CodeQL finding',
  };
}

function normalizeCodeQualityFinding(
  raw: Record<string, unknown>,
): NormalizedFinding {
  const severity = text(raw.severity);
  const confidence = text(raw.confidence);
  return {
    category: text(raw.category) ?? 'Code Quality',
    confidence: codeQualityConfidence(confidence),
    description: truncate(text(raw.description)),
    evidenceMasked: safeCodeEvidence(text(raw.evidence)),
    filePath: text(raw.path),
    impact:
      'Quality issues increase maintenance cost, review risk, and the chance of security fixes being applied inconsistently.',
    lineEnd: numberValue(raw.lineEnd),
    lineStart: numberValue(raw.lineStart),
    rawJson: {
      category: text(raw.category) ?? '',
      confidence: confidence ?? 'UNKNOWN',
      severity: severity ?? 'UNKNOWN',
    },
    recommendation:
      text(raw.recommendation) ??
      'Refactor the highlighted code and add focused tests for the changed behavior.',
    scanner: 'code-quality',
    severity: codeQualitySeverity(severity),
    status: FindingStatus.OPEN,
    title: text(raw.title) ?? 'Code quality issue',
  };
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
  storeCodeEvidence: boolean,
): NormalizedFinding {
  const extra = recordValue(raw.extra);
  const metadata = recordValue(extra.metadata);
  const severity = text(extra.severity);
  const message = text(extra.message);
  const cwe = metadataText(metadata.cwe);
  const checkId = text(raw.check_id);
  const references = metadataText(metadata.references);
  const category =
    metadataText(metadata.category) ??
    metadataText(metadata.technology) ??
    metadataText(metadata.subcategory) ??
    inferCategory(checkId) ??
    'SAST';
  const recommendation =
    text(extra.fix) ??
    metadataText(metadata.fix) ??
    metadataText(metadata.recommendation) ??
    metadataText(metadata.remediation) ??
    defaultSemgrepRecommendation(category);
  return {
    category,
    confidence: semgrepConfidence(metadataText(metadata.confidence)),
    cwe,
    description: message,
    evidenceMasked: storeCodeEvidence
      ? safeCodeEvidence(text(extra.lines))
      : undefined,
    filePath: text(raw.path),
    lineEnd: numberValue(recordValue(raw.end).line),
    lineStart: numberValue(recordValue(raw.start).line),
    impact:
      metadataText(metadata.impact) ??
      metadataText(metadata.likelihood) ??
      defaultSemgrepImpact(category),
    owasp: metadataText(metadata.owasp) ?? inferOwasp(cwe),
    rawJson: {
      check_id: checkId ?? '',
      path: text(raw.path) ?? '',
      references: references ?? '',
      severity: severity ?? 'UNKNOWN',
    },
    recommendation,
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

function codeQualitySeverity(value?: string): FindingSeverity {
  const normalized = value?.toUpperCase();
  if (normalized === 'HIGH') return FindingSeverity.HIGH;
  if (normalized === 'MEDIUM') return FindingSeverity.MEDIUM;
  if (normalized === 'LOW') return FindingSeverity.LOW;
  if (normalized === 'INFO') return FindingSeverity.INFO;
  return FindingSeverity.UNKNOWN;
}

function codeQlSeverity(
  securitySeverity: number,
  level?: string,
): FindingSeverity {
  if (Number.isFinite(securitySeverity)) {
    if (securitySeverity >= 8) return FindingSeverity.HIGH;
    if (securitySeverity >= 5) return FindingSeverity.MEDIUM;
    if (securitySeverity > 0) return FindingSeverity.LOW;
  }
  if (level === 'error') return FindingSeverity.HIGH;
  if (level === 'warning') return FindingSeverity.MEDIUM;
  if (level === 'note') return FindingSeverity.INFO;
  return FindingSeverity.UNKNOWN;
}

function codeQlConfidence(value?: string): FindingConfidence {
  if (value === 'very-high' || value === 'high') return FindingConfidence.HIGH;
  if (value === 'medium') return FindingConfidence.MEDIUM;
  if (value === 'low') return FindingConfidence.LOW;
  return FindingConfidence.UNKNOWN;
}

function codeQlImpact(securitySeverity: number, tags?: string): string {
  if (tags?.toLowerCase().includes('security')) {
    return 'CodeQL identified a semantic security flow or pattern that may be exploitable when reachable.';
  }
  if (Number.isFinite(securitySeverity) && securitySeverity >= 5) {
    return 'CodeQL assigned this alert elevated security severity based on query metadata.';
  }
  return 'CodeQL identified a code path that should be reviewed for correctness, maintainability, or security impact.';
}

function codeQualityConfidence(value?: string): FindingConfidence {
  const normalized = value?.toUpperCase();
  if (normalized === 'HIGH') return FindingConfidence.HIGH;
  if (normalized === 'MEDIUM') return FindingConfidence.MEDIUM;
  if (normalized === 'LOW') return FindingConfidence.LOW;
  return FindingConfidence.UNKNOWN;
}

function semgrepConfidence(value?: string): FindingConfidence {
  const normalized = value?.toUpperCase();
  if (normalized === 'HIGH') return FindingConfidence.HIGH;
  if (normalized === 'MEDIUM') return FindingConfidence.MEDIUM;
  if (normalized === 'LOW') return FindingConfidence.LOW;
  return FindingConfidence.UNKNOWN;
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

function inferCategory(checkId?: string): string | undefined {
  if (!checkId) return undefined;
  const normalized = checkId.toLowerCase();
  if (normalized.includes('xss')) return 'Cross-Site Scripting';
  if (normalized.includes('sqli') || normalized.includes('sql-injection')) {
    return 'SQL Injection';
  }
  if (
    normalized.includes('command-injection') ||
    normalized.includes('exec') ||
    normalized.includes('shell')
  ) {
    return 'Command Injection';
  }
  if (normalized.includes('ssrf')) return 'Server-Side Request Forgery';
  if (normalized.includes('path-traversal')) return 'Path Traversal';
  if (normalized.includes('jwt')) return 'Authentication';
  if (normalized.includes('csrf')) return 'Cross-Site Request Forgery';
  if (normalized.includes('secret') || normalized.includes('credential')) {
    return 'Secret Handling';
  }
  return undefined;
}

function defaultSemgrepImpact(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes('injection')) {
    return 'Unsafe input reaching an interpreter can allow attackers to execute unintended queries or commands.';
  }
  if (normalized.includes('secret')) {
    return 'Weak secret handling can expose credentials or tokens to unauthorized users.';
  }
  if (normalized.includes('authentication')) {
    return 'Authentication weaknesses can let attackers bypass identity checks or impersonate users.';
  }
  if (normalized.includes('scripting')) {
    return 'Untrusted content rendered in a browser can execute attacker-controlled JavaScript.';
  }
  return 'The matched code pattern may introduce an exploitable security weakness if reachable in production.';
}

function defaultSemgrepRecommendation(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes('injection')) {
    return 'Use parameterized APIs or safe framework helpers, validate inputs, and avoid building interpreter commands with string concatenation.';
  }
  if (normalized.includes('secret')) {
    return 'Move secrets to a dedicated secret manager or environment variable, rotate exposed values, and avoid committing credentials.';
  }
  if (normalized.includes('authentication')) {
    return 'Use vetted authentication middleware, enforce secure defaults, and add tests for bypass and replay scenarios.';
  }
  if (normalized.includes('scripting')) {
    return 'Escape or sanitize untrusted output using framework-native APIs and avoid rendering raw HTML.';
  }
  return 'Review the highlighted code, apply the framework-recommended secure pattern, and add regression tests for the risky path.';
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
