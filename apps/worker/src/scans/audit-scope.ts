import { readdir } from 'node:fs/promises';
import path from 'node:path';

const SKIPPED_DIRECTORIES = new Set(['.git', '.kodeye-results']);
const MAX_ENTRIES = 250_000;

export interface AuditScope {
  directories: number;
  files: number;
  topDirectories: string[];
  topExtensions: string[];
  truncated: boolean;
}

export async function inspectAuditScope(
  repositoryPath: string,
): Promise<AuditScope> {
  const pending = [repositoryPath];
  const topDirectories = new Map<string, number>();
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
          const childDirectory = path.join(directory, entry.name);
          pending.push(childDirectory);
          const relative = path.relative(repositoryPath, childDirectory);
          const topDirectory = relative.split(path.sep)[0];
          if (topDirectory) {
            topDirectories.set(
              topDirectory,
              (topDirectories.get(topDirectory) ?? 0) + 1,
            );
          }
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
    topDirectories: [...topDirectories.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 12)
      .map(([directory, count]) => `${directory}:${count}`),
    topExtensions: [...extensions.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([extension, count]) => `${extension}:${count}`),
    truncated,
  };
}
