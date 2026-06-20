import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

import { safeChildPath } from '../common/filesystem';
import { processCommand } from '../common/process-command';
import { readJsonFile, recordValue } from '../common/safe-json';
import type { WorkerEnvironment } from '../config/env';

const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  csharp: ['.cs'],
  go: ['.go'],
  'java-kotlin': ['.java', '.kt', '.kts'],
  'javascript-typescript': ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'],
  python: ['.py'],
  ruby: ['.rb'],
};
const LANGUAGE_QUERY_PACK: Record<string, string> = {
  csharp: 'codeql/csharp-queries:codeql-suites/csharp-security-and-quality.qls',
  go: 'codeql/go-queries:codeql-suites/go-security-and-quality.qls',
  'java-kotlin':
    'codeql/java-queries:codeql-suites/java-security-and-quality.qls',
  'javascript-typescript':
    'codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls',
  python: 'codeql/python-queries:codeql-suites/python-security-and-quality.qls',
  ruby: 'codeql/ruby-queries:codeql-suites/ruby-security-and-quality.qls',
};
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
const BUILD_MODE_NONE_LANGUAGES = new Set(['csharp', 'java-kotlin']);

export async function runCodeQlScanner(
  repositoryPath: string,
  environment: WorkerEnvironment,
) {
  const outputDirectory = safeChildPath(repositoryPath, '.kodeye-results');
  const databaseRoot = safeChildPath(outputDirectory, 'codeql-databases');
  await mkdir(databaseRoot, { recursive: true });
  const detectedLanguages = await detectCodeQlLanguages(
    repositoryPath,
    environment.codeqlLanguages,
  );
  const runs: unknown[] = [];
  const warnings: string[] = [];

  for (const language of detectedLanguages) {
    const databasePath = safeChildPath(databaseRoot, safeSegment(language));
    const createResult = await processCommand(
      environment.codeqlBin,
      [
        'database',
        'create',
        databasePath,
        '--overwrite',
        '--source-root',
        repositoryPath,
        '--language',
        language,
        ...codeQlDatabaseCreateBuildArgs(language),
      ],
      repositoryPath,
      environment.scannerTimeoutMs,
    );
    if (createResult.exitCode !== 0) {
      warnings.push(
        `${language} database create failed: ${shortReason(createResult.stderr) ?? createResult.error ?? `exit ${createResult.exitCode}`}`,
      );
      continue;
    }

    const outputPath = safeChildPath(
      outputDirectory,
      `codeql-${safeSegment(language)}.sarif`,
    );
    const analyzeResult = await processCommand(
      environment.codeqlBin,
      [
        'database',
        'analyze',
        databasePath,
        ...codeQlQueriesForLanguage(language, environment.codeqlQueries),
        '--format',
        'sarif-latest',
        '--output',
        outputPath,
      ],
      repositoryPath,
      environment.scannerTimeoutMs,
    );
    if (analyzeResult.exitCode !== 0) {
      warnings.push(
        `${language} analyze failed: ${shortReason(analyzeResult.stderr) ?? analyzeResult.error ?? `exit ${analyzeResult.exitCode}`}`,
      );
      continue;
    }

    const sarif = recordValue(await readJsonFile(outputPath));
    runs.push(...(Array.isArray(sarif.runs) ? sarif.runs : []));
  }

  if (runs.length === 0 && warnings.length > 0) {
    throw new Error(warnings.slice(0, 3).join('; '));
  }

  return {
    runs,
    version: '2.1.0',
    warnings,
  };
}

function codeQlDatabaseCreateBuildArgs(language: string) {
  return BUILD_MODE_NONE_LANGUAGES.has(language)
    ? ['--build-mode', 'none']
    : [];
}

async function detectCodeQlLanguages(
  repositoryPath: string,
  configuredLanguages: string[],
) {
  const available = new Set<string>();
  const pending = [repositoryPath];
  while (pending.length) {
    const directory = pending.pop();
    if (!directory) break;
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const childPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) pending.push(childPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      for (const [language, extensions] of Object.entries(
        LANGUAGE_EXTENSIONS,
      )) {
        if (extensions.includes(extension)) available.add(language);
      }
    }
  }
  return configuredLanguages.filter((language) => available.has(language));
}

function codeQlQueriesForLanguage(
  language: string,
  configuredQueries: string[],
): string[] {
  if (configuredQueries.length) return configuredQueries;
  const defaultQuery = LANGUAGE_QUERY_PACK[language];
  return defaultQuery ? [defaultQuery] : [];
}

function safeSegment(value: string) {
  return value.replace(/[^a-z0-9._-]/gi, '-');
}

function shortReason(value: string): string | undefined {
  const reason = value.trim().split(/\r?\n/, 1)[0]?.slice(0, 300);
  return reason || undefined;
}
