import { mkdir } from 'node:fs/promises';

import { safeChildPath } from '../common/filesystem';
import { processCommand } from '../common/process-command';
import { readJsonFile } from '../common/safe-json';
import type { WorkerEnvironment } from '../config/env';

export type ScannerName = 'semgrep' | 'gitleaks' | 'trivy';

export interface ScannerRun {
  name: ScannerName;
  output: unknown;
  success: boolean;
  warning?: string;
}

export async function runScanner(
  name: ScannerName,
  repositoryPath: string,
  environment: WorkerEnvironment,
): Promise<ScannerRun> {
  const outputDirectory = safeChildPath(repositoryPath, '.kodeye-results');
  await mkdir(outputDirectory, { recursive: true });
  const outputPath = safeChildPath(outputDirectory, `${name}.json`);
  const definition = scannerDefinition(
    name,
    repositoryPath,
    outputPath,
    environment,
  );
  const result = await processCommand(
    definition.bin,
    definition.args,
    repositoryPath,
    environment.scannerTimeoutMs,
  );

  try {
    const output = await readJsonFile(outputPath);
    return {
      name,
      output,
      success: true,
      ...(result.exitCode === 0
        ? {}
        : { warning: `${name} completed with exit code ${result.exitCode}` }),
    };
  } catch {
    return {
      name,
      output: null,
      success: false,
      warning:
        result.error ??
        shortReason(result.stderr) ??
        `${name} did not produce valid JSON output`,
    };
  }
}

function scannerDefinition(
  name: ScannerName,
  repositoryPath: string,
  outputPath: string,
  environment: WorkerEnvironment,
) {
  if (name === 'semgrep') {
    return {
      args: [
        'scan',
        '--config',
        'p/security-audit',
        '--json',
        '--output',
        outputPath,
        repositoryPath,
      ],
      bin: environment.semgrepBin,
    };
  }
  if (name === 'gitleaks') {
    return {
      args: [
        'detect',
        '--source',
        repositoryPath,
        '--report-format',
        'json',
        '--report-path',
        outputPath,
        '--no-git',
      ],
      bin: environment.gitleaksBin,
    };
  }
  return {
    args: [
      'fs',
      '--scanners',
      'vuln,misconfig',
      '--format',
      'json',
      '--output',
      outputPath,
      repositoryPath,
    ],
    bin: environment.trivyBin,
  };
}

function shortReason(value: string): string | undefined {
  const reason = value.trim().split(/\r?\n/, 1)[0]?.slice(0, 300);
  return reason || undefined;
}
