import { FindingSeverity } from '@prisma/client';

import type { NormalizedFinding } from './finding-normalizer';

export const BUG_BOUNTY_CATALOG_VERSION = '2026.06';

interface BugBountyPattern {
  category: string;
  cwe?: string;
  impact: string;
  owasp: string;
  patterns: RegExp[];
  recommendation: string;
  severity: FindingSeverity;
}

const patterns: BugBountyPattern[] = [
  pattern(
    'Remote Code Execution',
    FindingSeverity.CRITICAL,
    'CWE-78, CWE-94, CWE-502',
    'OWASP Top 10 2021 A03: Injection',
    [
      /\b(remote code execution|rce|command injection|code injection|unsafe deserialization)\b/i,
      /\bCWE-(78|94|502)\b/i,
    ],
    'Remove attacker-controlled code or command execution, use safe APIs, and strictly validate inputs.',
    'Attackers may execute arbitrary commands or code on the affected system.',
  ),
  pattern(
    'Authentication Bypass',
    FindingSeverity.CRITICAL,
    'CWE-287, CWE-288, CWE-306',
    'OWASP Top 10 2021 A07: Identification and Authentication Failures',
    [
      /\b(auth(?:entication)? bypass|missing authentication)\b/i,
      /\bCWE-(288|306)\b/i,
    ],
    'Enforce authentication centrally and add deny-by-default authorization tests.',
    'Attackers may access protected functionality without valid authentication.',
  ),
  pattern(
    'SQL Injection',
    FindingSeverity.CRITICAL,
    'CWE-89',
    'OWASP Top 10 2021 A03: Injection',
    [/\b(sql injection|sqli)\b/i, /\bCWE-89\b/i],
    'Use parameterized queries and prevent untrusted input from changing query structure.',
    'Attackers may read or modify database contents and potentially compromise the application.',
  ),
  pattern(
    'Path Traversal',
    FindingSeverity.CRITICAL,
    'CWE-22',
    'OWASP Top 10 2021 A01: Broken Access Control',
    [/\b(path traversal|directory traversal)\b/i, /\bCWE-22\b/i],
    'Resolve paths against an allowed base directory and reject paths that escape it.',
    'Attackers may read or overwrite files outside the intended directory.',
  ),
  pattern(
    'IDOR / BOLA',
    FindingSeverity.HIGH,
    'CWE-639',
    'OWASP Top 10 2021 A01: Broken Access Control',
    [/\b(idor|bola|insecure direct object reference)\b/i, /\bCWE-639\b/i],
    'Authorize every object access against the authenticated user and tenant.',
    'Attackers may access or modify another user or tenant resource.',
  ),
  pattern(
    'Server-Side Template Injection',
    FindingSeverity.HIGH,
    'CWE-1336',
    'OWASP Top 10 2021 A03: Injection',
    [/\b(server-side template injection|ssti)\b/i, /\bCWE-1336\b/i],
    'Do not evaluate attacker-controlled templates and use strict template sandboxing.',
    'Attackers may access sensitive data or execute server-side code through template evaluation.',
  ),
  pattern(
    'JWT Validation Weakness',
    FindingSeverity.HIGH,
    'CWE-345, CWE-347',
    'OWASP Top 10 2021 A07: Identification and Authentication Failures',
    [
      /\b(jwt|json web token).*(algorithm|signature|validation|verify|secret)\b/i,
      /\bCWE-347\b/i,
    ],
    'Pin approved algorithms, verify signatures and claims, and use strong managed keys.',
    'Attackers may forge or reuse authentication tokens.',
  ),
  pattern(
    'Race Condition',
    FindingSeverity.HIGH,
    'CWE-362',
    'OWASP Top 10 2021 A04: Insecure Design',
    [/\b(race condition|time-of-check|toctou)\b/i, /\bCWE-362\b/i],
    'Make the operation atomic and enforce invariants inside a transaction or lock.',
    'Concurrent requests may bypass limits or corrupt security-sensitive state.',
  ),
  pattern(
    'OAuth Misconfiguration',
    FindingSeverity.HIGH,
    'CWE-601',
    'OWASP Top 10 2021 A07: Identification and Authentication Failures',
    [/\b(oauth|openid|oidc).*(redirect|state|pkce|callback|misconfig)\b/i],
    'Use exact redirect URI allowlists and validate state, nonce, and PKCE where applicable.',
    'Attackers may steal authorization codes, tokens, or authenticated sessions.',
  ),
  pattern(
    'Cross-Site Scripting',
    FindingSeverity.MEDIUM,
    'CWE-79',
    'OWASP Top 10 2021 A03: Injection',
    [
      /\b(reflected xss|cross-site scripting|cross site scripting)\b/i,
      /\bCWE-79\b/i,
    ],
    'Apply context-aware output encoding and avoid unsafe HTML or script sinks.',
    'Attackers may execute script in a victim browser and compromise user sessions.',
  ),
  pattern(
    'CORS Misconfiguration',
    FindingSeverity.MEDIUM,
    'CWE-942',
    'OWASP Top 10 2021 A05: Security Misconfiguration',
    [
      /\b(cors|cross-origin resource sharing).*(wildcard|misconfig|origin|credential)\b/i,
      /\bCWE-942\b/i,
    ],
    'Allow only trusted origins and never combine credentialed requests with broad origin matching.',
    'Untrusted origins may read sensitive cross-origin responses.',
  ),
  pattern(
    'User Enumeration',
    FindingSeverity.MEDIUM,
    'CWE-204',
    'OWASP Top 10 2021 A07: Identification and Authentication Failures',
    [/\b(user|account|email) enumeration\b/i, /\bCWE-204\b/i],
    'Return consistent responses and timing for existing and non-existing accounts.',
    'Attackers may discover valid accounts and improve targeted attacks.',
  ),
  pattern(
    'HTTP Parameter Pollution',
    FindingSeverity.MEDIUM,
    'CWE-235',
    'OWASP Top 10 2021 A04: Insecure Design',
    [/\b(http parameter pollution|hpp)\b/i, /\bCWE-235\b/i],
    'Define duplicate parameter behavior and reject ambiguous security-sensitive input.',
    'Ambiguous parameters may bypass validation or authorization controls.',
  ),
  pattern(
    'Multi-Factor Authentication Weakness',
    FindingSeverity.MEDIUM,
    'CWE-308',
    'OWASP Top 10 2021 A07: Identification and Authentication Failures',
    [
      /\b(2fa|mfa|multi-factor|two-factor).*(bypass|missing|weak)\b/i,
      /\bCWE-308\b/i,
    ],
    'Enforce MFA on every protected flow, including recovery and alternate login paths.',
    'Attackers may bypass an expected additional authentication factor.',
  ),
  pattern(
    'Clickjacking',
    FindingSeverity.LOW,
    'CWE-1021',
    'OWASP Top 10 2021 A05: Security Misconfiguration',
    [/\b(clickjacking|frame-ancestors|x-frame-options)\b/i, /\bCWE-1021\b/i],
    'Set a restrictive CSP frame-ancestors directive and X-Frame-Options where needed.',
    'Attackers may trick users into interacting with hidden application controls.',
  ),
  pattern(
    'Missing Security Header',
    FindingSeverity.LOW,
    'CWE-693',
    'OWASP Top 10 2021 A05: Security Misconfiguration',
    [
      /\b(missing|absent).*(security header|content-security-policy|x-content-type-options)\b/i,
      /\bCWE-693\b/i,
    ],
    'Configure appropriate browser security headers at the application or edge layer.',
    'Missing defense-in-depth headers can increase the impact of other vulnerabilities.',
  ),
  pattern(
    'Weak TLS or Cryptography',
    FindingSeverity.LOW,
    'CWE-326, CWE-327',
    'OWASP Top 10 2021 A02: Cryptographic Failures',
    [
      /\b(weak tls|weak ssl|obsolete tls|weak cipher|broken cryptographic)\b/i,
      /\bCWE-(326|327)\b/i,
    ],
    'Disable obsolete protocols and weak algorithms and use current secure defaults.',
    'Weak transport or cryptographic protection may expose sensitive data.',
  ),
  pattern(
    'Directory Listing',
    FindingSeverity.INFO,
    'CWE-548',
    'OWASP Top 10 2021 A05: Security Misconfiguration',
    [/\bdirectory listing\b/i, /\bCWE-548\b/i],
    'Disable directory listing and explicitly publish only intended files.',
    'Directory contents may reveal files useful for further attacks.',
  ),
  pattern(
    'Banner Disclosure',
    FindingSeverity.INFO,
    'CWE-200',
    'OWASP Top 10 2021 A05: Security Misconfiguration',
    [/\b(banner|version|server) disclosure\b/i],
    'Remove unnecessary product and version details from public responses.',
    'Service details may help attackers select targeted exploits.',
  ),
  pattern(
    'Robots.txt Disclosure',
    FindingSeverity.INFO,
    undefined,
    'OWASP Top 10 2021 A05: Security Misconfiguration',
    [/\brobots\.txt\b/i],
    'Do not use robots.txt to protect sensitive paths or secrets.',
    'Published paths may reveal useful reconnaissance information.',
  ),
];

const severityRank: Record<FindingSeverity, number> = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  INFO: 1,
  UNKNOWN: 0,
};

export function classifyBugBountyFinding(
  finding: NormalizedFinding,
): NormalizedFinding {
  const haystack = [
    finding.title,
    finding.category,
    finding.description,
    finding.cwe,
    finding.owasp,
  ]
    .filter(Boolean)
    .join(' ');
  const matched = patterns.find((item) =>
    item.patterns.some((candidate) => candidate.test(haystack)),
  );
  if (!matched) return finding;

  return {
    ...finding,
    category: matched.category,
    cwe: finding.cwe ?? matched.cwe,
    impact: finding.impact ?? matched.impact,
    owasp: finding.owasp ?? matched.owasp,
    recommendation: finding.recommendation ?? matched.recommendation,
    severity:
      severityRank[matched.severity] > severityRank[finding.severity]
        ? matched.severity
        : finding.severity,
  };
}

function pattern(
  category: string,
  severity: FindingSeverity,
  cwe: string | undefined,
  owasp: string,
  matchers: RegExp[],
  recommendation: string,
  impact: string,
): BugBountyPattern {
  return {
    category,
    cwe,
    impact,
    owasp,
    patterns: matchers,
    recommendation,
    severity,
  };
}
