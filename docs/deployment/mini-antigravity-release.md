# Mini Antigravity Release Deployment

This guide covers the scanner, AI review, AI fix, and approved GitHub PR
automation changes.

## What changed

- GitHub OAuth login can guide users to install the GitHub App when repository
  access is not connected yet.
- GitHub App callback syncs selected repositories after installation.
- The scanner worker audits the cloned repository from the repository root.
- Semgrep, Gitleaks, and Trivy run against the full working tree.
- `SCANNER_SEMGREP_INCLUDE_IGNORED=true` makes Semgrep use
  `--no-git-ignore` by default.
- Scan detail now includes a code-editor-style audit workspace with scanner
  progress, folder/file context, masked evidence, and Ask AI actions.
- Groq-powered Ask AI can review findings without storing prompts or responses.
- Generate Fix can fetch one target file, propose a full-file fix, show preview,
  and create a GitHub pull request only after explicit user approval.

## Privacy posture

- Repository source is cloned only into the worker temporary directory.
- Production compose mounts `/tmp/kodeye/scans` as `tmpfs`.
- Worker cleanup removes the temporary repository after success or failure.
- Scanner evidence is masked.
- `SCANNER_STORE_CODE_EVIDENCE=false` is the default.
- AI review sends sanitized finding metadata only.
- AI fix sends only the single target file after the user clicks Generate Fix.
- AI prompts, responses, and fix proposals are not persisted.
- AI GitHub writes are disabled unless `AI_GITHUB_WRITE_ENABLED=true`.

## Required VPS environment

Update `.env.production` on the VPS:

```env
SCAN_WORKER_ENABLED=true
SCANNER_EXECUTION_MODE=local-cli
SCAN_WORKER_TEMP_DIR=/tmp/kodeye/scans
SCANNER_SEMGREP_CONFIGS=p/security-audit,p/owasp-top-ten
SCANNER_SEMGREP_INCLUDE_IGNORED=true
SCANNER_GITLEAKS_BIN=gitleaks
SCANNER_TRIVY_SCANNERS=vuln,misconfig,secret
SCANNER_STORE_CODE_EVIDENCE=false
SCANNER_TIMEOUT_MS=900000

AI_ENABLED=true
GROQ_API_KEY=replace-with-production-key
GROQ_MODEL=llama-3.3-70b-versatile
AI_MAX_COMPLETION_TOKENS=1200
AI_FIX_MAX_COMPLETION_TOKENS=16000
AI_FIX_MAX_FILE_BYTES=30000
AI_GITHUB_WRITE_ENABLED=false
```

Keep `AI_GITHUB_WRITE_ENABLED=false` for the first deploy. Turn it on only
after GitHub App permissions are updated and manual scanner validation passes.

## GitHub App permissions

Base scanner automation:

- Metadata: Read-only
- Checks: Read & write

Approved AI fix automation additionally requires:

- Contents: Read & write
- Pull requests: Read & write

After changing permissions in GitHub, repository owners may need to approve the
updated GitHub App installation. Without approval, PR creation can fail even if
the environment flag is enabled.

## Deploy steps

From the VPS project directory:

```bash
git pull origin main
cp .env.production.example .env.production # only if this is a fresh install
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:migrate:deploy
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

If the worker image was already cached before scanner changes:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build --no-cache worker
docker compose --env-file .env.production -f docker-compose.prod.yml up -d worker
```

## Smoke test

1. Open the frontend and login.
2. Connect GitHub from Dashboard -> Integrations -> GitHub.
3. Install or update the GitHub App and select a test repository.
4. Confirm repository sync creates or exposes scan actions.
5. Start a scan.
6. Watch worker logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f worker
```

7. Confirm scan logs include:
   - `full working-tree audit scope`
   - `top audited folders`
   - `semgrep completed`
   - `gitleaks completed`
   - `trivy completed`
8. Open the scan detail page and confirm the code audit workspace appears.
9. Open a finding and run Ask AI.
10. Keep `AI_GITHUB_WRITE_ENABLED=false` until you are ready to test PR writes.

## Approved PR write test

Use a disposable repository first.

1. Update GitHub App permissions for Contents and Pull requests read/write.
2. Approve the GitHub App permission update from the target account.
3. Set `AI_GITHUB_WRITE_ENABLED=true`.
4. Recreate API container:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate api
```

5. Open a file-backed finding.
6. Click Generate Fix.
7. Review the full-file preview.
8. Tick the explicit approval checkbox.
9. Create the pull request.
10. Confirm Kodeye creates a `kodeye/ai-*` branch and does not push to the
    default branch.

## Rollback

Disable AI write automation immediately:

```env
AI_GITHUB_WRITE_ENABLED=false
AI_ENABLED=false
```

Then recreate API:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate api
```

Scanner rollback can be done by setting:

```env
SCAN_WORKER_ENABLED=false
```

Then recreate worker:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate worker
```
