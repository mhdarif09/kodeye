# Pull and Rebuild Release

Use this when the server is already provisioned and DevOps only needs to pull
the latest Kodeye code, apply database migrations, and rebuild containers.

Run every command from `/opt/kodeye`.

## 1. Pull latest code

```bash
git status
git pull origin main
```

If the server tracks a different production branch, replace `main` with that
branch name.

## 2. Review production env

Before rebuilding, make sure `.env.production` contains the new security and
scanner settings expected by this release:

```env
API_DOCS_ENABLED=false
API_MAX_BODY_BYTES=1048576
RATE_LIMIT_ENABLED=true
REQUIRE_HTTPS=true
SCANNER_CODEQL_BIN=codeql
SCANNER_CODEQL_LANGUAGES=javascript-typescript,python,go,java-kotlin,csharp,ruby
SCANNER_SEMGREP_CONFIGS=p/default,p/security-audit,p/owasp-top-ten,p/cwe-top-25,p/secrets
SCANNER_SEMGREP_INCLUDE_IGNORED=true
SCANNER_TRIVY_SCANNERS=vuln,misconfig,secret
SCANNER_STORE_CODE_EVIDENCE=false
```

Keep `SCANNER_STORE_CODE_EVIDENCE=false` unless the organization explicitly
accepts source snippet retention.

## 3. Apply database migrations

This release adds the `blog_posts` table for public blog content and admin blog
management. It also includes the earlier Contact Sales/admin inbox migrations,
so run migrations before restarting traffic.

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:migrate:deploy
```

## 4. Rebuild and restart

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

If DevOps wants a clean rebuild without using old image layers:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build --no-cache
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## 5. Verify containers

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 api
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 worker
```

## 6. Smoke test

```bash
curl http://127.0.0.1:3001/api/health
curl https://backend.kodeye.net/api/health
curl -I https://kodeye.net
curl -I https://kodeye.net/blog
```

Open these pages after deploy:

- `https://kodeye.net`
- `https://kodeye.net/services`
- `https://kodeye.net/blog`
- `https://kodeye.net/contact-sales`
- `https://app.kodeye.net/onboarding`
- `https://app.kodeye.net/dashboard/repositories`
- `https://app.kodeye.net/dashboard/scans`
- `https://app.kodeye.net/dashboard/admin/sales-inquiries`
- `https://app.kodeye.net/dashboard/admin/blog`

Then run one scan from a repository and verify:

- Scan logs show `code-quality`, `semgrep`, `codeql`, `gitleaks`, and `trivy`.
- The scan workspace opens like an editor and shows folder/file diagnostics.
- AI source preview is blocked for secret-like files and works for safe source files.
- Reports do not show raw secrets.

## Quick operator checklist

1. `git pull origin main`
2. Confirm `.env.production` has the new API/security/scanner values
3. Run `prisma:migrate:deploy`
4. Rebuild `api`, `frontend`, and `worker`
5. Start containers with `up -d`
6. Check `ps` and logs
7. Smoke test backend health, landing page, blog, login, onboarding,
   repositories, scans, contact sales, admin sales inbox, and admin blog

## What changed in this release

- Admin blog management: add, update, publish/draft, and delete posts.
- Public blog pages at `/blog` and `/blog/[slug]`, included in sitemap.
- SEO metadata, robots, sitemap, manifest, canonical URLs, and JSON-LD.
- Frontend and API security headers, stricter body-size checks, origin checks,
  and production API docs gating.
- Stronger auth DTO validation and password complexity.
- API client handling for non-JSON or invalid JSON API responses.
- Global Kodeye loading screen for route and auth/data transitions.
- Startup landing page with services, pricing, testimonials, and audit animation.
- Detailed individual service pages.
- Public Contact Sales page connected to admin sales inbox.
- Admin sidebar cleanup: one main Admin entry, sub-admin links inside Admin
  Console.
- GitHub sign-in/onboarding flow improvements for app install, auth, and sync.
- Persistent onboarding completion so completed users return to dashboard after
  logout/login.
- Manual repository flow clarified: public GitHub URL is supported now; private
  repositories use the GitHub App; ZIP/folder upload is a future artifact scan
  flow.
- Scan workspace now shows real scanned folders/files from scan findings/logs
  instead of placeholder folders.
- Connected GitHub findings can open a safe source preview for the target file
  and keep AI review/fix actions attached to that finding.
- Scanner worker uses code-quality, Semgrep CE, CodeQL, Gitleaks, and Trivy
  with shell-less command execution and temp workspace cleanup.
