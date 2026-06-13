# Secure Coding Checklist

- Put tenant/owner predicates in the database query, not only in controllers.
- Validate DTO shape, length, enums, URLs, branch names, and provider identifiers.
- Never use shell interpolation for scanner/git commands.
- Escape all untrusted HTML and cap stored provider/scanner output.
- Never log credentials, raw authorization headers, private keys, or provider payloads containing secrets.
- Verify webhook signatures before parsing/processing and make handlers idempotent.
- Compare payment provider, local order, currency, and amount before activation.
- Keep startup-critical secrets environment-only and rotate credentials after exposure.
- Add negative authorization and duplicate-delivery tests with each new endpoint.
