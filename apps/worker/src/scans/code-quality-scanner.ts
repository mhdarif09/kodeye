import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const MAX_FILES = 5000;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_FINDINGS = 1000;
const SKIPPED_DIRECTORIES = new Set([
  '.git',
  '.hg',
  '.svn',
  '.kodeye-results',
  '.next',
  '.nuxt',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target',
  'vendor',
]);
const SOURCE_EXTENSIONS = new Set([
  '.c',
  '.cc',
  '.cpp',
  '.cs',
  '.go',
  '.java',
  '.js',
  '.jsx',
  '.kt',
  '.php',
  '.py',
  '.rb',
  '.rs',
  '.ts',
  '.tsx',
]);

export interface CodeQualityFinding {
  category: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  description: string;
  evidence?: string;
  lineEnd?: number;
  lineStart?: number;
  path: string;
  recommendation: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | 'UNKNOWN';
  title: string;
}

export interface CodeQualityOutput {
  results: CodeQualityFinding[];
  scannedFiles: number;
  truncated: boolean;
}

export async function runCodeQualityScanner(
  repositoryPath: string,
): Promise<CodeQualityOutput> {
  const files = await collectSourceFiles(repositoryPath);
  const results: CodeQualityFinding[] = [];
  for (const filePath of files.paths) {
    if (results.length >= MAX_FINDINGS) break;
    const relativePath = path.relative(repositoryPath, filePath);
    const fileStat = await stat(filePath);
    if (fileStat.size > MAX_FILE_BYTES) continue;
    const content = await readFile(filePath, 'utf8');
    results.push(...analyzeFile(relativePath, content));
  }
  return {
    results: results.slice(0, MAX_FINDINGS),
    scannedFiles: files.paths.length,
    truncated: files.truncated || results.length > MAX_FINDINGS,
  };
}

async function collectSourceFiles(repositoryPath: string) {
  const pending = [repositoryPath];
  const paths: string[] = [];
  let truncated = false;
  while (pending.length) {
    const directory = pending.pop();
    if (!directory) break;
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (paths.length >= MAX_FILES) {
        truncated = true;
        pending.length = 0;
        break;
      }
      if (entry.isSymbolicLink()) continue;
      const childPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) pending.push(childPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        paths.push(childPath);
      }
    }
  }
  return { paths, truncated };
}

function analyzeFile(filePath: string, content: string): CodeQualityFinding[] {
  const lines = content.split(/\r?\n/);
  const findings: CodeQualityFinding[] = [];
  if (lines.length > 500) {
    findings.push({
      category: 'Maintainability',
      confidence: 'HIGH',
      description:
        'This source file is large enough to make review and future changes harder.',
      lineStart: 1,
      path: filePath,
      recommendation:
        'Split unrelated responsibilities into smaller modules and keep public interfaces narrow.',
      severity: lines.length > 1000 ? 'MEDIUM' : 'LOW',
      title: `Large source file (${lines.length} lines)`,
    });
  }

  const duplicateLines = repeatedSignificantLines(lines);
  if (duplicateLines.length >= 4) {
    findings.push({
      category: 'Duplication',
      confidence: 'MEDIUM',
      description:
        'Several substantial lines repeat in this file, which can make fixes inconsistent.',
      evidence: duplicateLines.slice(0, 4).join('\n'),
      lineStart: 1,
      path: filePath,
      recommendation:
        'Extract duplicated logic into a helper, shared validation path, or single configuration source.',
      severity: 'LOW',
      title: 'Repeated code patterns in file',
    });
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    if (/\b(TODO|FIXME|HACK)\b/i.test(trimmed)) {
      findings.push({
        category: 'Maintainability',
        confidence: 'MEDIUM',
        description:
          'A TODO/FIXME/HACK marker was left in source code and may represent unfinished behavior.',
        evidence: trimmed,
        lineStart: lineNumber,
        path: filePath,
        recommendation:
          'Resolve the marker or link it to a tracked issue with clear ownership and deadline.',
        severity: 'INFO',
        title: 'Unresolved maintenance marker',
      });
    }
    if (/\bconsole\.(log|debug|trace)\s*\(/.test(trimmed)) {
      findings.push({
        category: 'Debug Code',
        confidence: 'HIGH',
        description:
          'Debug logging in application code can leak implementation details or create noisy output.',
        evidence: trimmed,
        lineStart: lineNumber,
        path: filePath,
        recommendation:
          'Remove debug logging or replace it with structured logger calls controlled by log level.',
        severity: 'LOW',
        title: 'Debug console call left in code',
      });
    }
    if (/\bdebugger\s*;/.test(trimmed)) {
      findings.push({
        category: 'Debug Code',
        confidence: 'HIGH',
        description: 'A debugger statement can pause execution in production.',
        evidence: trimmed,
        lineStart: lineNumber,
        path: filePath,
        recommendation: 'Remove debugger statements before merging.',
        severity: 'MEDIUM',
        title: 'Debugger statement in source',
      });
    }
    if (/\bany\b/.test(trimmed) && /\.(ts|tsx)$/.test(filePath)) {
      findings.push({
        category: 'Type Safety',
        confidence: 'MEDIUM',
        description:
          'Use of `any` removes TypeScript checks around this code path.',
        evidence: trimmed,
        lineStart: lineNumber,
        path: filePath,
        recommendation:
          'Replace `any` with a domain type, generic constraint, unknown plus narrowing, or a validated schema.',
        severity: 'LOW',
        title: 'Loose TypeScript `any` usage',
      });
    }
    if (/eslint-disable|ts-ignore|type:\s*ignore|noinspection/i.test(trimmed)) {
      findings.push({
        category: 'Suppressed Checks',
        confidence: 'MEDIUM',
        description:
          'A static analysis or type-check suppression hides problems from automated review.',
        evidence: trimmed,
        lineStart: lineNumber,
        path: filePath,
        recommendation:
          'Remove the suppression or add a narrow justification with a follow-up test.',
        severity: 'LOW',
        title: 'Static analysis suppression',
      });
    }
  });

  findings.push(...complexityFindings(filePath, lines));
  return findings.slice(0, 50);
}

function complexityFindings(filePath: string, lines: string[]) {
  const findings: CodeQualityFinding[] = [];
  const functionPattern =
    /\b(function\s+\w+|\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|\w+\([^)]*\)\s*\{)/;
  for (let index = 0; index < lines.length; index += 1) {
    if (!functionPattern.test(lines[index] ?? '')) continue;
    const window = lines.slice(index, Math.min(index + 120, lines.length));
    const branchCount = window.filter((line) =>
      /\b(if|for|while|switch|case|catch)\b|\?\s*|&&|\|\|/.test(line),
    ).length;
    if (branchCount >= 12) {
      findings.push({
        category: 'Complexity',
        confidence: 'MEDIUM',
        description:
          'This function appears to contain many branches, which increases review and test burden.',
        evidence: lines[index]?.trim(),
        lineStart: index + 1,
        path: filePath,
        recommendation:
          'Extract smaller functions, flatten guard clauses, and add focused tests for each branch.',
        severity: branchCount >= 20 ? 'MEDIUM' : 'LOW',
        title: `High branching complexity (${branchCount} branch signals)`,
      });
    }
  }
  return findings;
}

function repeatedSignificantLines(lines: string[]) {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 32) continue;
    if (/^[{}[\]),;]+$/.test(trimmed)) continue;
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1])
    .map(([line]) => line);
}
