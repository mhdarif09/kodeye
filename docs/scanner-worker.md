# Scanner Worker

## Local versus Docker worker

Standard local development keeps:

```env
SCAN_WORKER_ENABLED=false
SCANNER_EXECUTION_MODE="disabled"
```

The worker starts without polling jobs, so Semgrep, Gitleaks, Trivy, and Docker
are not required on developer laptops. Scan jobs remain `PENDING`.

The Docker/VPS worker uses:

```env
SCAN_WORKER_ENABLED=true
SCANNER_EXECUTION_MODE="local-cli"
SCAN_WORKER_TEMP_DIR="/tmp/kodeye/scans"
```

## Worker lifecycle

1. Poll the oldest `PENDING` job and claim it with a conditional update.
2. Load its GitHub repository and organization.
3. Find the organization's GitHub App installation.
4. Sign a short-lived GitHub App JWT and request an installation token.
5. Clone the selected repository branch with depth one.
   The authenticated `origin` remote is removed immediately after clone.
6. Run Semgrep, Gitleaks, and Trivy sequentially.
7. Parse and normalize valid JSON output.
8. Mask secret evidence and save findings plus severity counts.
9. Mark the job `SUCCESS` when at least one scanner succeeds, otherwise
   `FAILED`.
10. Remove the temporary repository in a `finally` block.

Installation tokens exist only in worker memory. They are not stored or logged.

## Scanner commands

```text
semgrep scan --config p/security-audit --json --output <output> <repoPath>
gitleaks detect --source <repoPath> --report-format json --report-path <output> --no-git
trivy fs --scanners vuln,misconfig --format json --output <output> <repoPath>
```

Scanner output is written below
`<SCAN_WORKER_TEMP_DIR>/<scanJobId>/.kodeye-results/`. Each command has a
timeout, bounded stdout/stderr capture, and runs with `shell: false`.

## Normalization

- Semgrep maps code findings to SAST findings. `ERROR`, `WARNING`, and `INFO`
  become `HIGH`, `MEDIUM`, and `INFO`.
- Gitleaks maps findings to `CRITICAL` secret leaks. `Secret` and `Match` are
  masked before persistence.
- Trivy maps vulnerabilities to dependency findings and misconfigurations to
  configuration findings using Trivy severity.

Raw JSON stored with findings is a small sanitized subset, not the full scanner
result.

## Security constraints

- Never run repository package scripts, tests, builds, or arbitrary code.
- Never run `npm install` inside a scanned repository.
- Never log private keys, tokens, authenticated URLs, or full secrets.
- Never persist GitHub installation tokens.
- Clone only into a validated child of `SCAN_WORKER_TEMP_DIR`.
- Clean the temporary scan directory after success or failure.
- Treat scanner JSON as untrusted input and reject oversized JSON files.
- Partial scanner failure creates warning logs; all scanners failing fails the
  scan.

## Docker worker

Build and run:

```bash
docker build -f infra/docker/worker.Dockerfile -t kodeye-worker .
docker compose -f docker-compose.scanner.yml up --build worker
```

The image includes Node.js 20, pnpm, git, Semgrep, Gitleaks, Trivy,
certificates, curl, Python, and unzip. It generates Prisma Client during build
but never runs migrations. Runtime secrets come from environment variables.

Mount the private key file into the container and set
`GITHUB_APP_PRIVATE_KEY_PATH` to the container path. Inline private keys are not
supported.

Example Compose mount:

```yaml
volumes:
  - ./kodeye-github-app.pem:/run/secrets/kodeye-github-app.pem:ro
```

When MySQL runs on the Docker host, use `host.docker.internal` in
`DATABASE_URL`. When it runs in another container, use that service name.

## Known limitations

Phase 6 uses database polling with concurrency one. It does not include
Redis/BullMQ, multi-worker coordination beyond conditional claiming, final
production hardening, webhooks, reports, or automated finding triage.
