# Final QA Checklist

- Run `pnpm lint`, API/worker builds, and an isolated frontend production build.
- Run database migration/seed against a disposable database.
- Run `scripts/local-smoke-test.ps1` or `.sh`.
- Test login/register validation, expired/invalid JWT, and rate-limit responses.
- Execute the IDOR/BOLA checklist with two users and two organizations.
- Test repository sync, manual scan, webhook duplicate delivery, failed scanner, and cleanup.
- Test Free plan PDF denial and paid plan HTML/PDF/JSON report downloads.
- Test Midtrans/PayPal success, failure, duplicate callback, wrong amount, and wrong currency.
- Verify admin settings are masked, clearable, auditable, and inaccessible to non-admins.
- Search logs/database responses for known test secrets before release.
