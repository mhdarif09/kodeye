import { readdir } from 'node:fs/promises';
import path from 'node:path';

const SKIPPED_DIRECTORIES = new Set(['.git', '.kodeye-results']);
const MAX_ENTRIES = 250_000;

export interface AuditScope {
  directories: number;
  files: number;
  topExtensions: string[];
  truncated: boolean;
}

export async function inspectAuditScope(
  repositoryPath: string,
): Promise<AuditScope> {
  const pending = [repositoryPath];
  const extensions = new Map<string, number>();
  let directories = 0;
  let files = 0;
  let truncated = false;

  while (pending.length) {
    const directory = pending.pop();
    if (!directory) break;
    directories += 1;
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (files + directories >= MAX_ENTRIES) {
        truncated = true;
        pending.length = 0;
        break;
      }
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) {
          pending.push(path.join(directory, entry.name));
        }
        continue;
      }
      if (!entry.isFile()) continue;
      files += 1;
      const extension =
        path.extname(entry.name).toLowerCase() || '[no extension]';
      extensions.set(extension, (extensions.get(extension) ?? 0) + 1);
    }
  }

  return {
    directories,
    files,
    topExtensions: [...extensions.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([extension, count]) => `${extension}:${count}`),
    truncated,
  };
}
