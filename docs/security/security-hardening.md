# Security Hardening

Kodeye applies authorization at the service/query boundary, validates all DTOs,
uses explicit production CORS origins, adds security headers and request IDs,
and rate-limits sensitive endpoints. Secrets are encrypted in `app_settings`,
masked in admin responses, and redacted from unexpected API and worker errors.

Payment state changes only after provider signature verification and local
order, amount, currency, and provider checks. Paid activation uses a
transactional status claim so duplicate callbacks do not redeem coupons or
create invoices twice.

Before production, replace all seed credentials, set strong environment-only
`JWT_SECRET`, `DATABASE_URL`, and `SETTINGS_ENCRYPTION_KEY`, configure explicit
`CORS_ORIGIN`, and terminate TLS at a reviewed reverse proxy. The in-memory
rate limiter is intentionally local-only; use a shared gateway/Redis limiter
when running multiple API instances.

Keep `REQUIRE_HTTPS=true` and `SCANNER_STORE_CODE_EVIDENCE=false` in
production. The scanner workspace must remain ephemeral and RAM-backed. See
[`source-code-processing.md`](source-code-processing.md) for the enforceable
transport and zero-retention policy.
