# Incident Response

1. Contain: disable affected integration/provider, revoke sessions/tokens, and stop suspicious workers.
2. Preserve: retain redacted API/worker logs, admin audit records, webhook event IDs, payment IDs, and timestamps.
3. Assess: identify tenants, credentials, source repositories, and payment records affected.
4. Eradicate: patch the root cause and rotate GitHub, Midtrans, PayPal, JWT, database, and settings-encryption credentials as applicable.
5. Recover: restore service gradually, replay only verified idempotent events, and monitor errors/audit logs.
6. Review: document timeline, impact, fixes, tests, and preventive work.

Do not paste secrets or raw customer source code into tickets or chat.
