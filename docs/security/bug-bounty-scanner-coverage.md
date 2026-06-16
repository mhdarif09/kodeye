# Bug-Bounty Scanner Coverage

Kodeye combines deterministic scanners with a versioned bug-bounty
classification catalog. The catalog enriches findings with a normalized
category, CWE, OWASP mapping, impact, recommendation, and minimum severity. It
never lowers severity assigned by an underlying scanner.

Current catalog version: `2026.06`.

## Covered Finding Families

The current catalog recognizes the finding families explicitly supplied for
the product:

| Tier     | Finding families                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------- |
| Critical | Remote code execution, authentication bypass, SQL injection, path traversal                         |
| High     | IDOR/BOLA, server-side template injection, JWT validation weaknesses, race conditions, OAuth issues |
| Medium   | Cross-site scripting, CORS misconfiguration, user enumeration, HTTP parameter pollution, MFA issues |
| Low      | Clickjacking, missing security headers, weak TLS or cryptography                                    |
| Info     | Directory listing, banner disclosure, robots.txt disclosure                                         |

The supplied tier totals add up to 51 rather than 55 and did not include the
full bug names or CWE list. Kodeye therefore does not claim a 55-bug catalog
until the missing four entries and complete source list are provided.

## Detection Boundaries

Semgrep, Gitleaks, and Trivy can reliably detect many source-code patterns,
known vulnerable dependencies, leaked secrets, and configuration issues. Some
bug-bounty classes require runtime or contextual testing:

- IDOR/BOLA requires authorization checks using multiple users or tenants.
- Race conditions require concurrent requests and invariant validation.
- OAuth issues require full redirect, state, nonce, PKCE, and provider-flow
  testing.
- User enumeration often requires response and timing comparison.
- MFA bypass requires testing recovery and alternate authentication flows.
- Business-logic vulnerabilities require threat modeling and manual review.

These classes may be classified when a scanner produces a strong signal, but
absence of a finding is not proof that the vulnerability does not exist.

## Updating Safely

Changes to classification or scanner rules should:

1. Increment the catalog version.
2. Add positive and negative regression fixtures.
3. Run the existing scanner suite against representative repositories.
4. Review false-positive and false-negative changes.
5. Roll out gradually and retain the previous version for rollback.

Vulnerability databases may update frequently. Detection-rule changes should
be reviewed and tested before becoming a production deployment gate.
