# GitHub Webhook Automation

Phase 8 adds automatic scans from GitHub App webhooks and reports scan progress
through GitHub Check Runs. It does not use Personal Access Tokens and never
stores installation tokens.

## Required GitHub App Configuration

Repository permissions:

- Metadata: Read-only
- Contents: Read-only
- Pull requests: Read-only
- Checks: Read & write

Subscribe to these events:

- Push
- Pull request
- Repository
- Installation
- Installation repositories

Configure the webhook URL as `https://your-api.example/api/github/webhook` and
use the same secret as `GITHUB_APP_WEBHOOK_SECRET`.

## Signature Validation and Raw Body

The webhook endpoint is public because GitHub cannot send a Kodeye JWT. Every
request must include `x-hub-signature-256`, `x-github-event`, and
`x-github-delivery`.

NestJS starts with `rawBody: true`. The signature service computes an HMAC
SHA-256 over the untouched request body and compares it with
`x-hub-signature-256` using a timing-safe comparison. Invalid signatures return
HTTP 401 before the payload is processed.

## Deduplication

Every delivery ID is stored in `github_webhook_deliveries` with its processing
status. Repeated delivery IDs are ignored. Push scans are also deduplicated by
repository, commit SHA, and trigger type. Pull request scans are deduplicated by
repository, PR number, and commit SHA.

Set `GITHUB_WEBHOOK_ENABLED=false` to record a signed delivery as disabled
without processing any supported event.

## Event Flows

### Push

Branch pushes trigger a scan only when global push automation and the
repository's push setting are enabled. Tags are ignored. The repository must be
connected, selected by the GitHub App, and match by GitHub repository ID.
Currently only the repository default branch is scanned automatically.

### Pull Request

Actions `opened`, `synchronize`, `reopened`, and `ready_for_review` can trigger
a scan. Draft pull requests are skipped until `ready_for_review`.

### Repository and Installation

Repository metadata events update known repositories without starting scans.
Removed or unavailable repositories are retained for scan history and marked
disconnected. Installation repository additions sync metadata when an existing
organization mapping is known.

## Check Run Lifecycle

When a webhook scan is created, Kodeye creates a queued Check Run. The worker
updates it to `in_progress`, then completes it:

- Critical or high findings: `failure`
- No critical or high findings: `success`
- Scan execution failure: `failure`

A successful check only means no critical/high findings were detected by the
enabled scanners. It is not a guarantee that the codebase is vulnerability-free.
Check Run API failures are logged as scan warnings and do not fail the scan.

## Local Testing with ngrok

1. Run the API on port 3001 and frontend on port 3000.
2. Run `ngrok http 3001`.
3. Set the GitHub App webhook URL to
   `https://<ngrok-host>/api/github/webhook`.
4. Set the same webhook secret in GitHub and `GITHUB_APP_WEBHOOK_SECRET`.
5. Restart the API, push a commit, or open a pull request.
6. Inspect GitHub App webhook deliveries, Kodeye scan history, and the commit
   Check Run.

For VPS, use the public HTTPS API domain instead of ngrok. Keep the webhook
secret and GitHub App private key outside source control.

## Troubleshooting

- `Invalid GitHub webhook signature`: verify the webhook secret matches and no
  proxy modifies the request body.
- Delivery is ignored: verify the repository was synced, remains connected, and
  its automation toggle is enabled.
- Check Run is missing: verify Checks permission is Read & write, then accept
  the updated GitHub App permission request.
- Scan stays pending: start an enabled scanner worker.

## Known Limitations

- No PR comments or SARIF upload
- No GitHub Code Scanning integration
- No advanced branch policy engine
- No Redis/BullMQ or multi-worker scaling
- No payment gating, Kubernetes, or production deployment automation
