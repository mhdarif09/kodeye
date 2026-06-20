# Scanner

Scanner config mengatur worker, Semgrep, Gitleaks, Trivy, timeout, dan temp directory.

Settings:

- `SCAN_WORKER_ENABLED`
- `SCAN_WORKER_POLL_INTERVAL_MS`
- `SCAN_WORKER_MAX_CONCURRENCY`
- `SCAN_WORKER_TEMP_DIR`
- `SCANNER_EXECUTION_MODE`
- `SCANNER_CODEQL_BIN`
- `SCANNER_CODEQL_LANGUAGES`
- `SCANNER_CODEQL_QUERIES`
- `SCANNER_SEMGREP_BIN`
- `SCANNER_SEMGREP_CONFIGS`
- `SCANNER_SEMGREP_INCLUDE_IGNORED`
- `SCANNER_SEMGREP_JOBS`
- `SCANNER_SEMGREP_MAX_TARGET_BYTES`
- `SCANNER_SEMGREP_PRO`
- `SCANNER_SEMGREP_TIMEOUT_SECONDS`
- `SCANNER_GITLEAKS_BIN`
- `SCANNER_TRIVY_BIN`
- `SCANNER_TRIVY_SCANNERS`
- `SCANNER_STORE_CODE_EVIDENCE`
- `SCANNER_TIMEOUT_MS`

Semgrep default profile:

- `p/default`
- `p/security-audit`
- `p/owasp-top-ten`
- `p/cwe-top-25`
- `p/secrets`

Semgrep excludes generated and dependency-heavy folders such as `node_modules`,
`dist`, `build`, `.next`, `.git`, and Kodeye's `.kodeye-results` output.

CodeQL layer:

- Runs after Semgrep as a second semantic analysis layer.
- Detects configured languages only when matching source files exist.
- Uses each language's `security-and-quality` query suite by default.
- Set `SCANNER_CODEQL_QUERIES` to override query packs or suites.

Catatan Phase 10:

- Worker membaca `app_settings` langsung dari shared database saat startup.
- Environment tetap menjadi fallback untuk runtime kritikal.
- Restart worker setelah mengubah scanner settings agar nilai baru diterapkan.
- Worker tidak boleh mengeksekusi user code, hanya scanner tools.

Test:

1. Start worker.
2. Create scan job.
3. Watch scan logs.

Common errors:

- Worker disabled.
- Scanner binary missing.
- Repository clone failed.
- Trivy DB update lambat/gagal.
