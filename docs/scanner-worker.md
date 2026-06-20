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
AUTO_SCAN_ON_SYNC_ENABLED=true
SCANNER_CODEQL_BIN=codeql
SCANNER_CODEQL_LANGUAGES=javascript-typescript,python,go,java-kotlin,csharp,ruby
SCANNER_CODEQL_QUERIES=
SCANNER_SEMGREP_CONFIGS="p/default,p/security-audit,p/owasp-top-ten,p/cwe-top-25,p/secrets"
SCANNER_SEMGREP_INCLUDE_IGNORED=true
SCANNER_SEMGREP_JOBS=4
SCANNER_SEMGREP_MAX_TARGET_BYTES=1000000
SCANNER_SEMGREP_PRO=false
SCANNER_SEMGREP_TIMEOUT_SECONDS=60
SCANNER_TRIVY_SCANNERS="vuln,misconfig,secret"
SCANNER_STORE_CODE_EVIDENCE=false
SCANNER_TIMEOUT_MS=900000
```

When a repository is first synchronized from a GitHub App installation,
`AUTO_SCAN_ON_SYNC_ENABLED=true` queues an initial full-repository audit
automatically.

## Worker lifecycle

1. Poll the oldest `PENDING` job and claim it with a conditional update.
2. Load its GitHub repository and organization.
3. Find the organization's GitHub App installation.
4. Sign a short-lived GitHub App JWT and request an installation token.
5. Clone the selected repository branch with depth one.
   The authenticated `origin` remote is removed immediately after clone.
6. Inventory the full working tree, log the audited folder/file count, then run
   Kodeye code-quality, Semgrep, Gitleaks, and Trivy sequentially from the
   repository root.
7. Parse and normalize valid JSON output.
8. Mask secret evidence and save findings plus severity counts.
9. Mark the job `SUCCESS` when at least one scanner succeeds, otherwise
   `FAILED`.
10. Remove the temporary repository in a `finally` block.

Installation tokens exist only in worker memory. They are not stored or logged.

## Scanner commands

```text
semgrep scan --config p/default --config p/security-audit --config p/owasp-top-ten --config p/cwe-top-25 --config p/secrets --exclude <generated/dependency dirs> --no-git-ignore --jobs 4 --max-target-bytes 1000000 --metrics off --timeout 60 --json --output <output> <repoPath>
codeql database create <db> --source-root <repoPath> --language <detected-language>
codeql database analyze <db> <language-security-and-quality-suite> --format sarif-latest --output <output>
gitleaks detect --source <repoPath> --report-format json --report-path <output> --no-git
trivy fs --scanners vuln,misconfig,secret --format json --output <output> <repoPath>
```

Kodeye's internal `code-quality` scanner does not execute repository code. It
walks supported source files one by one and checks maintainability signals such
as large files, high branching complexity, TODO/FIXME/HACK markers, debug code,
TypeScript `any`, static-analysis suppressions, and repeated code patterns.

Scanner output is written below
`<SCAN_WORKER_TEMP_DIR>/<scanJobId>/.kodeye-results/`. Each command has a
timeout, bounded stdout/stderr capture, and runs with `shell: false`.

## Normalization

- Semgrep maps code findings to SAST findings. Default, Security Audit, OWASP
  Top 10, CWE Top 25, and Secrets rulesets run against the full cloned working
  tree. By default,
  `SCANNER_SEMGREP_INCLUDE_IGNORED=true` adds `--no-git-ignore` so tracked
  source folders are not skipped only because of `.gitignore`. Generated and
  dependency-heavy folders are excluded to keep scans fast and focused.
  `ERROR`, `WARNING`, and `INFO` become `HIGH`, `MEDIUM`, and `INFO`.
  Semgrep metadata is used to enrich confidence, category, impact,
  references, OWASP, and remediation guidance when available.
- CodeQL runs as a second SAST layer after Semgrep. It creates databases only
  for detected configured languages, then analyzes the security-and-quality
  query suite for each language. CodeQL SARIF alerts are normalized into
  `codeql` findings with rule precision, security severity, CWE/OWASP metadata,
  and file locations when available.
- Gitleaks maps findings to `CRITICAL` secret leaks. `Secret` and `Match` are
  masked before persistence.
- Kodeye code-quality maps file-by-file quality findings to maintainability,
  duplication, type-safety, complexity, debug-code, and suppression findings.
- Trivy maps vulnerabilities to dependency findings, misconfigurations to
  configuration findings, and detected secrets to masked secret findings using
  Trivy severity.

OWASP metadata from Semgrep is preserved. Common CWE identifiers from Semgrep
and Trivy are also mapped to the corresponding OWASP Top 10 2021 category when
possible.

Normalized findings are also enriched by the versioned bug-bounty
classification catalog documented in
[`security/bug-bounty-scanner-coverage.md`](security/bug-bounty-scanner-coverage.md).
The catalog can raise a finding's severity when a strong name or CWE signal is
present, but it never lowers the underlying scanner severity.

Raw JSON stored with findings is a small sanitized subset, not the full scanner
result.

By default, Semgrep source snippets are not persisted. Set
`SCANNER_STORE_CODE_EVIDENCE=true` only when the organization explicitly
accepts source snippet retention.

## Security constraints

- Never run repository package scripts, tests, builds, or arbitrary code.
- Never run `npm install` inside a scanned repository.
- Never log private keys, tokens, authenticated URLs, or full secrets.
- Never persist GitHub installation tokens.
- Clone only into a validated child of `SCAN_WORKER_TEMP_DIR`.
- Scan from the repository root and audit every folder in the cloned working
  tree, excluding only `.git`, Kodeye's internal `.kodeye-results`, and
  symlinks during inventory.
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

The image includes Node.js 20, pnpm, git, Semgrep, CodeQL, Gitleaks, Trivy,
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
