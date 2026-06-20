import { mkdir } from 'node:fs/promises';

import { safeChildPath } from '../common/filesystem';
import { processCommand } from '../common/process-command';
import { readJsonFile } from '../common/safe-json';
import type { WorkerEnvironment } from '../config/env';
import { runCodeQualityScanner } from './code-quality-scanner';
import { runCodeQlScanner } from './codeql-scanner';

export type ScannerName =
  | 'code-quality'
  | 'codeql'
  | 'semgrep'
  | 'gitleaks'
  | 'trivy';

const SEMGREP_EXCLUDES = [
  '.git',
  '.hg',
  '.svn',
  '.kodeye-results',
  '.next',
  '.nuxt',
  '.turbo',
  'coverage',
  'dist',
  'build',
  'out',
  'node_modules',
  'vendor',
  'venv',
  '.venv',
  '__pycache__',
  'target',
  'bin',
  'obj',
];

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
  if (name === 'code-quality') {
    try {
      return {
        name,
        output: await runCodeQualityScanner(repositoryPath),
        success: true,
      };
    } catch (error) {
      return {
        name,
        output: null,
        success: false,
        warning:
          error instanceof Error
            ? error.message
            : 'code quality scanner failed',
      };
    }
  }
  if (name === 'codeql') {
    try {
      const output = await runCodeQlScanner(repositoryPath, environment);
      return {
        name,
        output,
        success: true,
        ...(Array.isArray(output.warnings) && output.warnings.length
          ? { warning: output.warnings.slice(0, 3).join('; ') }
          : {}),
      };
    } catch (error) {
      return {
        name,
        output: null,
        success: false,
        warning: error instanceof Error ? error.message : 'codeql failed',
      };
    }
  }
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
        ...environment.semgrepConfigs.flatMap((config) => ['--config', config]),
        ...SEMGREP_EXCLUDES.flatMap((pattern) => ['--exclude', pattern]),
        ...(environment.semgrepIncludeIgnored ? ['--no-git-ignore'] : []),
        ...(environment.semgrepPro ? ['--pro'] : []),
        '--jobs',
        String(environment.semgrepJobs),
        '--max-target-bytes',
        String(environment.semgrepMaxTargetBytes),
        '--metrics',
        'off',
        '--timeout',
        String(environment.semgrepTimeoutSeconds),
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
      environment.trivyScanners.join(','),
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
