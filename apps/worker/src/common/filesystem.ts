import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

export function safeChildPath(root: string, ...parts: string[]): string {
  const resolvedRoot = path.resolve(root);
  const resolvedChild = path.resolve(resolvedRoot, ...parts);
  if (
    resolvedChild !== resolvedRoot &&
    !resolvedChild.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new Error('Refusing filesystem access outside scan temp directory');
  }
  return resolvedChild;
}

export async function prepareDirectory(pathValue: string) {
  await rm(pathValue, { force: true, recursive: true });
  await mkdir(pathValue, { recursive: true });
}

export async function removeDirectory(pathValue: string) {
  await rm(pathValue, { force: true, recursive: true });
}
