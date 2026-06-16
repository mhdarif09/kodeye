export type ScannerExecutionMode = 'disabled' | 'local-cli';

export interface WorkerEnvironment {
  scanWorkerEnabled: boolean;
  pollIntervalMs: number;
  maxConcurrency: number;
  tempDir: string;
  scannerExecutionMode: ScannerExecutionMode;
  scannerTimeoutMs: number;
  storeCodeEvidence: boolean;
  semgrepBin: string;
  semgrepConfigs: string[];
  semgrepIncludeIgnored: boolean;
  gitleaksBin: string;
  trivyBin: string;
  trivyScanners: string[];
  githubAppId?: string;
  githubAppPrivateKeyPath?: string;
  githubCheckName: string;
  githubCheckDetailsBaseUrl: string;
}

function numberValue(name: string, fallback: number): number {
  const parsed = Number(process.env[name] ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function listValue(name: string, fallback: string[]): string[] {
  const values = (process.env[name] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length ? values : fallback;
}

export function loadWorkerEnvironment(): WorkerEnvironment {
  const mode = process.env.SCANNER_EXECUTION_MODE ?? 'disabled';
  return {
    gitleaksBin: process.env.SCANNER_GITLEAKS_BIN ?? 'gitleaks',
    githubAppId: process.env.GITHUB_APP_ID,
    githubAppPrivateKeyPath: process.env.GITHUB_APP_PRIVATE_KEY_PATH,
    githubCheckDetailsBaseUrl:
      process.env.GITHUB_CHECK_DETAILS_BASE_URL ??
      'http://localhost:3000/dashboard/scans',
    githubCheckName: process.env.GITHUB_CHECK_NAME ?? 'Kodeye Security Scan',
    maxConcurrency: numberValue('SCAN_WORKER_MAX_CONCURRENCY', 1),
    pollIntervalMs: numberValue('SCAN_WORKER_POLL_INTERVAL_MS', 5000),
    scanWorkerEnabled: process.env.SCAN_WORKER_ENABLED === 'true',
    scannerExecutionMode: mode === 'local-cli' ? 'local-cli' : 'disabled',
    scannerTimeoutMs: numberValue('SCANNER_TIMEOUT_MS', 900000),
    storeCodeEvidence: process.env.SCANNER_STORE_CODE_EVIDENCE === 'true',
    semgrepBin: process.env.SCANNER_SEMGREP_BIN ?? 'semgrep',
    semgrepConfigs: listValue('SCANNER_SEMGREP_CONFIGS', [
      'p/security-audit',
      'p/owasp-top-ten',
    ]),
    semgrepIncludeIgnored:
      process.env.SCANNER_SEMGREP_INCLUDE_IGNORED !== 'false',
    tempDir: process.env.SCAN_WORKER_TEMP_DIR ?? './tmp/scans',
    trivyBin: process.env.SCANNER_TRIVY_BIN ?? 'trivy',
    trivyScanners: listValue('SCANNER_TRIVY_SCANNERS', [
      'vuln',
      'misconfig',
      'secret',
    ]),
  };
}
