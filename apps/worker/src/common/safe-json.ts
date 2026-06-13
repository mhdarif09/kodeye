import { readFile } from 'node:fs/promises';

const MAX_JSON_BYTES = 50 * 1024 * 1024;

export async function readJsonFile(path: string): Promise<unknown> {
  const contents = await readFile(path, 'utf8');
  if (Buffer.byteLength(contents) > MAX_JSON_BYTES) {
    throw new Error('Scanner output exceeds the supported size limit');
  }
  return JSON.parse(contents) as unknown;
}

export function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
