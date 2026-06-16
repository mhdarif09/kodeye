# Source Code Processing

Kodeye uses a zero-retention source processing model by default. Source code is
transported over encrypted connections, processed in an ephemeral workspace,
and removed after each scan.

## Encrypted in Transit

- Browser and public API traffic must use HTTPS in production.
- Production API requests received without HTTPS are rejected when
  `REQUIRE_HTTPS=true`.
- GitHub repositories are cloned only through `https://github.com`.
- Git clone explicitly enables certificate verification and Git protocol v2.
- GitHub installation tokens are short-lived, remain in worker memory, and are
  removed from the local clone immediately after cloning.

Internal Docker traffic between Nginx and the API may use loopback HTTP. It is
not exposed publicly, and the original HTTPS protocol is forwarded using
`X-Forwarded-Proto`.

## Zero-Retention Defaults

- The production worker workspace uses a RAM-backed Docker `tmpfs`.
- The complete workspace and scanner output are removed after success or
  failure.
- `SCANNER_STORE_CODE_EVIDENCE=false` prevents Semgrep source snippets from
  being persisted with findings.
- Findings store metadata such as file path, line number, category, CWE, OWASP,
  severity, impact, and remediation.
- Secret evidence is masked before persistence.

Enabling `SCANNER_STORE_CODE_EVIDENCE=true` changes this posture because source
snippets may be stored in the database and reports.

## Security Claim

Kodeye may state:

> Source code is encrypted in transit and processed in isolated, temporary
> workspaces with zero-retention defaults.

Kodeye must not claim end-to-end encryption or that operators are technically
unable to access plaintext while a SaaS worker is actively processing it.

## Production Verification

1. Confirm public HTTP redirects to HTTPS.
2. Confirm invalid TLS certificates fail GitHub clone operations.
3. Confirm the worker mount for `/tmp/kodeye/scans` is `tmpfs`.
4. Run a scan and confirm the workspace is removed afterward.
5. Confirm findings do not contain Semgrep source snippets.
6. Confirm GitHub installation tokens and authenticated URLs never appear in
   logs.
