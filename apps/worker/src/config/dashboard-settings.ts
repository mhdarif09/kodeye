import type { PrismaClient } from '@prisma/client';
import { createDecipheriv, createHash } from 'node:crypto';

import type { ScannerExecutionMode, WorkerEnvironment } from './env';

const workerSettingKeys = [
  'GITHUB_APP_ID',
  'GITHUB_APP_PRIVATE_KEY_PATH',
  'GITHUB_CHECK_NAME',
  'GITHUB_CHECK_DETAILS_BASE_URL',
  'SCAN_WORKER_ENABLED',
  'SCAN_WORKER_POLL_INTERVAL_MS',
  'SCAN_WORKER_MAX_CONCURRENCY',
  'SCAN_WORKER_TEMP_DIR',
  'SCANNER_EXECUTION_MODE',
  'SCANNER_SEMGREP_BIN',
  'SCANNER_GITLEAKS_BIN',
  'SCANNER_TRIVY_BIN',
  'SCANNER_TIMEOUT_MS',
] as const;

export async function applyDashboardSettings(
  prisma: PrismaClient,
  environment: WorkerEnvironment,
) {
  const settings = await prisma.appSetting.findMany({
    where: { isActive: true, key: { in: [...workerSettingKeys] } },
  });
  const key = resolveEncryptionKey();
  const values = new Map<string, string>();
  for (const setting of settings) {
    try {
      if (setting.isSecret) {
        if (
          key &&
          setting.encryptedValue &&
          setting.encryptionIv &&
          setting.encryptionTag
        ) {
          values.set(
            setting.key,
            decrypt(
              setting.encryptedValue,
              setting.encryptionIv,
              setting.encryptionTag,
              key,
            ),
          );
        }
      } else if (setting.value !== null) {
        values.set(setting.key, setting.value);
      }
    } catch {
      // Ignore unreadable settings and continue with environment fallback.
    }
  }
  return {
    ...environment,
    gitleaksBin: values.get('SCANNER_GITLEAKS_BIN') ?? environment.gitleaksBin,
    githubAppId: values.get('GITHUB_APP_ID') ?? environment.githubAppId,
    githubAppPrivateKeyPath:
      values.get('GITHUB_APP_PRIVATE_KEY_PATH') ??
      environment.githubAppPrivateKeyPath,
    githubCheckDetailsBaseUrl:
      values.get('GITHUB_CHECK_DETAILS_BASE_URL') ??
      environment.githubCheckDetailsBaseUrl,
    githubCheckName:
      values.get('GITHUB_CHECK_NAME') ?? environment.githubCheckName,
    maxConcurrency: positiveNumber(
      values.get('SCAN_WORKER_MAX_CONCURRENCY'),
      environment.maxConcurrency,
    ),
    pollIntervalMs: positiveNumber(
      values.get('SCAN_WORKER_POLL_INTERVAL_MS'),
      environment.pollIntervalMs,
    ),
    scanWorkerEnabled: booleanValue(
      values.get('SCAN_WORKER_ENABLED'),
      environment.scanWorkerEnabled,
    ),
    scannerExecutionMode: executionMode(
      values.get('SCANNER_EXECUTION_MODE'),
      environment.scannerExecutionMode,
    ),
    scannerTimeoutMs: positiveNumber(
      values.get('SCANNER_TIMEOUT_MS'),
      environment.scannerTimeoutMs,
    ),
    semgrepBin: values.get('SCANNER_SEMGREP_BIN') ?? environment.semgrepBin,
    tempDir: values.get('SCAN_WORKER_TEMP_DIR') ?? environment.tempDir,
    trivyBin: values.get('SCANNER_TRIVY_BIN') ?? environment.trivyBin,
  };
}

function decrypt(encrypted: string, iv: string, tag: string, key: Buffer) {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function resolveEncryptionKey() {
  const configured =
    process.env.SETTINGS_ENCRYPTION_KEY ||
    process.env.APP_SETTINGS_ENCRYPTION_KEY ||
    process.env.JWT_SECRET;
  if (!configured) return null;
  if (/^[a-f0-9]{64}$/i.test(configured)) return Buffer.from(configured, 'hex');
  const base64 = Buffer.from(configured, 'base64');
  if (base64.length === 32) return base64;
  const raw = Buffer.from(configured, 'utf8');
  return raw.length === 32
    ? raw
    : createHash('sha256').update(configured).digest();
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function booleanValue(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

function executionMode(
  value: string | undefined,
  fallback: ScannerExecutionMode,
): ScannerExecutionMode {
  if (!value) return fallback;
  return value === 'local-cli' ? 'local-cli' : 'disabled';
}
