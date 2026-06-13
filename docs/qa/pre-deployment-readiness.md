# Pre-Deployment Readiness

- All lint/build/smoke and manual access-control checks pass.
- Seed admin password is replaced and test accounts/data are removed.
- Strong environment-only startup secrets are configured and backed up securely.
- Explicit HTTPS CORS/callback/webhook URLs are reviewed.
- Provider production credentials and webhook signatures are tested.
- Database backups, restore drill, migrations, monitoring, alerting, and log retention are owned.
- Shared rate limiting, TLS/reverse proxy, worker isolation, resource limits, and secret rotation are designed.
- Finance/legal review tax, invoices, refunds, subscriptions, and data retention.

This checklist is readiness guidance, not a production deployment configuration.
