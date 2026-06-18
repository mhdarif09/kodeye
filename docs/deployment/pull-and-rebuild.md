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

## 2. Apply database migrations

This release adds the `sales_inquiries` table for the public Contact Sales form
and admin sales inbox, so run migrations before restarting traffic.

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:migrate:deploy
```

## 3. Rebuild and restart

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

If DevOps wants a clean rebuild without using old image layers:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build --no-cache
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## 4. Verify containers

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 api
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 frontend
```

## 5. Smoke test

```bash
curl http://127.0.0.1:3001/api/health
curl https://backend.kodeye.net/api/health
```

Open these pages after deploy:

- `https://kodeye.net`
- `https://kodeye.net/services`
- `https://kodeye.net/contact-sales`
- `https://app.kodeye.net/onboarding`
- `https://app.kodeye.net/dashboard/repositories`
- `https://app.kodeye.net/dashboard/scans`
- `https://app.kodeye.net/dashboard/admin/sales-inquiries`

## Quick operator checklist

1. `git pull origin main`
2. Run `prisma:migrate:deploy`
3. Rebuild `api`, `frontend`, and `worker`
4. Start containers with `up -d`
5. Check `ps` and logs
6. Smoke test backend health, landing page, login, onboarding, repositories,
   scans, contact sales, and admin sales inbox

## What changed in this release

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
