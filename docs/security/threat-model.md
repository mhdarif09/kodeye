# Threat Model

## Protected assets

- User sessions, GitHub installation access, provider credentials, source code,
  findings, reports, invoices, subscriptions, and admin settings.

## Primary threats and controls

| Threat                           | Control                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| IDOR/BOLA across organizations   | Ownership/membership predicates in database queries; owner-only mutation checks           |
| Secret disclosure                | Encrypted settings, masked responses, redacted logs, generic 500 responses                |
| Forged webhook/payment callback  | Raw-body/signature verification, provider/order/amount/currency validation, deduplication |
| Command/path injection in worker | `spawn` without shell, branch/repository validation, bounded temp paths, cleanup          |
| XSS/report injection             | Escaped dynamic report and invoice HTML                                                   |
| Brute force/resource abuse       | DTO validation, sensitive-route rate limits, scan limits and command timeouts             |

## Trust boundaries

Browser, public webhooks, API, database, worker/scanner processes, GitHub,
Midtrans, PayPal, and currency providers are separate trust boundaries.
Provider payloads and scanner output remain untrusted even after transport
authentication.
