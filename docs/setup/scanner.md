# Scanner

Scanner config mengatur worker, Semgrep, Gitleaks, Trivy, timeout, dan temp directory.

Settings:

- `SCAN_WORKER_ENABLED`
- `SCAN_WORKER_POLL_INTERVAL_MS`
- `SCAN_WORKER_MAX_CONCURRENCY`
- `SCAN_WORKER_TEMP_DIR`
- `SCANNER_EXECUTION_MODE`
- `SCANNER_SEMGREP_BIN`
- `SCANNER_GITLEAKS_BIN`
- `SCANNER_TRIVY_BIN`
- `SCANNER_TIMEOUT_MS`

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
