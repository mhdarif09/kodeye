# Kodeye

Kodeye adalah fondasi untuk platform audit keamanan codebase. PHASE 1 membangun
monorepo dan local development. PHASE 2 menambahkan backend core. PHASE 3
menambahkan frontend core responsif. PHASE 4 menambahkan GitHub OAuth login dan
GitHub App installation untuk memilih serta menyinkronkan metadata repository.

> Scope saat ini sengaja terbatas. GitHub integration, scanner, payment, queue,
> report generator, dashboard kompleks, Docker, dan deployment belum dibuat.

## Requirements

- Node.js LTS 20 atau lebih baru
- pnpm 9 atau lebih baru
- MySQL lokal dari XAMPP, Laragon, MySQL Installer, atau service lokal lain

Install pnpm bila belum tersedia:

```bash
npm install --global pnpm
```

Jika PowerShell memblokir `pnpm.ps1` karena execution policy, gunakan
`pnpm.cmd` sebagai pengganti `pnpm`, atau sesuaikan execution policy untuk user
lokal sesuai kebijakan mesin Anda.

Docker belum digunakan dan tidak diperlukan pada PHASE 2. Database yang
ditargetkan adalah MySQL, bukan PostgreSQL.

## Local Setup

Install seluruh dependency workspace:

```bash
pnpm install
```

Salin environment example.

Windows CMD:

```bat
copy .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Konfigurasi default XAMPP biasanya:

```dotenv
DATABASE_URL="mysql://root:@localhost:3306/kodeye"
```

Jika MySQL menggunakan password:

```dotenv
DATABASE_URL="mysql://root:password@localhost:3306/kodeye"
```

Database `kodeye` perlu dibuat manual saat mulai menggunakan Prisma migration.
Build, lint, API startup, health check, dan CI tidak membutuhkan database aktif.
Endpoint auth/users/organizations/repositories membutuhkan MySQL aktif.

Tambahkan konfigurasi JWT lokal pada `.env`:

```dotenv
JWT_SECRET="replace-with-a-long-random-local-secret"
JWT_EXPIRES_IN="1d"
```

Jangan gunakan contoh `JWT_SECRET` dari `.env.example` di production.

Frontend membaca API URL dari `apps/frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

Untuk setup baru, salin `apps/frontend/.env.example` menjadi
`apps/frontend/.env.local`. Nilai fallback local development tetap mengarah ke
`http://localhost:3001/api`.

## Phase 2 Database Setup

Pastikan service MySQL lokal berjalan, lalu buat database:

```sql
CREATE DATABASE kodeye;
```

Generate Prisma client:

```bash
pnpm --filter api prisma:generate
```

Jalankan migration awal secara manual:

```bash
pnpm --filter api prisma:migrate
```

Migration tidak dijalankan otomatis saat API start dan tidak dijalankan di CI.

## Run Services

Jalankan seluruh service sekaligus:

```bash
pnpm dev
```

Jalankan service secara terpisah:

```bash
pnpm dev:frontend
pnpm dev:api
pnpm dev:worker
```

- Frontend: <http://localhost:3000>
- API: <http://localhost:3001>
- Swagger: <http://localhost:3001/api/docs>
- Worker startup log: `kodeye-worker is running`

## Phase 10 Admin Settings

Phase 10 menambahkan Admin Console, secure runtime settings, audit log, provider
test, dan dokumentasi credential setup. Mulai dari
[docs/setup/README.md](docs/setup/README.md).

Quick setup order:

1. Set env-only secrets: `DATABASE_URL`, `JWT_SECRET`, `SETTINGS_ENCRYPTION_KEY`.
2. Jalankan migration.
3. Jalankan seed admin.
4. Login admin.
5. Isi App URLs.
6. Isi GitHub OAuth.
7. Isi GitHub App.
8. Isi Midtrans.
9. Isi PayPal.
10. Klik provider tests.
11. Jalankan test scanning dan billing.

Admin Settings memakai database override dengan fallback ke environment. Secret
disimpan terenkripsi dan tidak dikirim balik secara full ke frontend.

## Phase 3 Frontend

Frontend tersedia di <http://localhost:3000> dan responsif untuk mobile, tablet,
laptop, serta desktop.

Flow utama:

1. Buka landing page `/`.
2. Buat akun di `/register`. Backend otomatis membuat organization pertama.
3. Login melalui `/login`.
4. Akses protected dashboard di `/dashboard`.
5. Buat organization di `/dashboard/organizations`.
6. Tambahkan metadata repository manual di `/dashboard/repositories`.
7. Ubah nama atau logout di `/dashboard/settings`.

Token akses disimpan di `localStorage` hanya untuk kesederhanaan PHASE 3.
Production sebaiknya mempertimbangkan strategi session atau HttpOnly cookie.
Frontend tidak menyimpan password atau data sensitif lain.

## Phase 4 GitHub Integration

GitHub OAuth dan GitHub App memiliki fungsi berbeda:

- GitHub OAuth digunakan hanya untuk login/link identity user.
- GitHub App digunakan untuk akses repository yang user pilih.
- OAuth access token user dan GitHub App installation token tidak disimpan
  permanen.
- Kodeye tidak meminta Personal Access Token.

Endpoint PHASE 4:

- `GET /api/auth/github`
- `GET /api/auth/github/callback`
- `GET /api/github/install`
- `GET /api/github/install/callback`
- `GET /api/github/installations`
- `POST /api/github/repositories/sync`
- `GET /api/github/repositories`

Tambahkan konfigurasi berikut ke root `.env` atau `apps/api/.env`:

```dotenv
GITHUB_OAUTH_CLIENT_ID=""
GITHUB_OAUTH_CLIENT_SECRET=""
GITHUB_OAUTH_CALLBACK_URL="http://localhost:3001/api/auth/github/callback"

GITHUB_APP_ID=""
GITHUB_APP_NAME="kodeye-local"
GITHUB_APP_PRIVATE_KEY_PATH="./kodeye-local.private-key.pem"
GITHUB_APP_WEBHOOK_SECRET=""
GITHUB_APP_INSTALL_URL="https://github.com/apps/kodeye-local/installations/new"
GITHUB_APP_CALLBACK_URL="http://localhost:3001/api/github/install/callback"

FRONTEND_AUTH_CALLBACK_URL="http://localhost:3000/auth/callback"
FRONTEND_GITHUB_INTEGRATION_URL="http://localhost:3000/dashboard/integrations/github"
```

`GITHUB_APP_PRIVATE_KEY_PATH` harus mengarah ke file PEM private key. Jangan
commit private key, OAuth client secret, webhook secret, OAuth token, atau
installation token.

### Create GitHub OAuth App

Di GitHub Developer Settings, buat OAuth App:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL:
  `http://localhost:3001/api/auth/github/callback`

Isi Client ID dan Client Secret ke environment backend. Test melalui tombol
**Continue with GitHub** di `/login` atau `/register`. Setelah callback, backend
menghasilkan JWT internal Kodeye dan frontend menyimpannya.

### Create GitHub App

Buat GitHub App, misalnya `Kodeye Local`:

- Homepage URL: `http://localhost:3000`
- Setup URL / Callback URL:
  `http://localhost:3001/api/github/install/callback`
- Repository permissions: Metadata read-only; Contents read/write hanya jika
  approved AI fix automation akan digunakan
- Pull requests read/write hanya jika approved AI fix automation akan digunakan
- Account permissions tidak diperlukan untuk identity user
- Installation target: any account atau account sendiri untuk local testing
- Aktifkan pilihan repository saat instalasi

Gunakan installation URL GitHub App sebagai `GITHUB_APP_INSTALL_URL`. Buka
`/dashboard/integrations/github`, pilih organization, lalu klik **Install GitHub
App**. Setelah GitHub callback menyimpan installation, klik **Sync
repositories**. Hanya metadata repository yang disimpan; repository belum
di-clone atau di-scan.

OAuth callback localhost biasanya dapat digunakan melalui browser. Jika GitHub
App setup callback membutuhkan URL publik, expose backend secara manual:

```bash
ngrok http 3001
```

Kemudian ubah Setup URL GitHub App dan `GITHUB_APP_CALLBACK_URL` ke URL publik
tersebut. Kodeye tidak menjalankan ngrok/cloudflared otomatis.

## Health Check

Saat API aktif:

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "status": "ok",
    "service": "kodeye-api"
  }
}
```

## Phase 2 API

Endpoint yang tersedia:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/organizations`
- `POST /api/organizations`
- `GET /api/organizations/:id`
- `GET /api/repositories`
- `POST /api/repositories`
- `GET /api/repositories/:id`

Swagger/OpenAPI tersedia di <http://localhost:3001/api/docs>.

### Test dengan Windows CMD

Register:

```bat
curl -X POST http://localhost:3001/api/auth/register ^
-H "Content-Type: application/json" ^
-d "{\"name\":\"Kal\",\"email\":\"kal@example.com\",\"password\":\"StrongPassword123!\"}"
```

Login:

```bat
curl -X POST http://localhost:3001/api/auth/login ^
-H "Content-Type: application/json" ^
-d "{\"email\":\"kal@example.com\",\"password\":\"StrongPassword123!\"}"
```

Me:

```bat
curl http://localhost:3001/api/auth/me ^
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test dengan PowerShell

Register:

```powershell
curl.exe -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Kal\",\"email\":\"kal@example.com\",\"password\":\"StrongPassword123!\"}'
```

Login:

```powershell
curl.exe -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"kal@example.com\",\"password\":\"StrongPassword123!\"}'
```

Me:

```powershell
curl.exe http://localhost:3001/api/auth/me `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Quality Commands

Build seluruh workspace:

```bash
pnpm build
```

Lint seluruh workspace:

```bash
pnpm lint
```

Format seluruh workspace:

```bash
pnpm format
```

Untuk memeriksa command yang sama dengan GitHub Actions secara lokal:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
```

## Project Structure

```text
kodeye/
|-- apps/
|   |-- frontend/       # Next.js frontend
|   |-- api/            # NestJS API dan Prisma foundation
|   `-- worker/         # Node.js TypeScript worker
|-- packages/
|   `-- shared/         # Shared types dan constants
|-- docs/
|   `-- architecture.md
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|-- .env.example
|-- eslint.config.mjs
|-- package.json
|-- pnpm-workspace.yaml
`-- tsconfig.base.json
```

## CI/CD

Workflow `.github/workflows/ci.yml` berjalan saat push dan pull request ke
branch `main`. Pipeline melakukan checkout, setup Node.js dan pnpm, install
dependency dengan frozen lockfile, lint, lalu build seluruh workspace.

CI tidak melakukan deployment, Docker build, Prisma migration, atau koneksi ke
MySQL. Build API menjalankan `prisma generate`, yang tidak membutuhkan koneksi
database.

## Deliberately Not Implemented

PHASE 6 tidak mengimplementasikan webhook push/pull request, GitHub Check Run,
GitHub PR comment, SARIF upload, Redis/BullMQ, PDF reports, payment,
subscription, full production Docker Compose, Kubernetes, atau deployment
hardening final.

## Phase 3 Manual Checklist

- Landing page terbuka di `/`
- Register dan login berhasil
- Dashboard tanpa token redirect ke `/login`
- Logout menghapus token
- Organization dapat dibuat dan ditampilkan
- Repository manual dapat dibuat dan ditampilkan
- Profile name dapat diperbarui
- Layout nyaman pada mobile, tablet, dan desktop
- `pnpm lint` dan `pnpm build` berhasil

## Phase 4 Manual Checklist

- Isi GitHub OAuth dan GitHub App environment variables
- Jalankan `pnpm --filter api prisma:generate`
- Jalankan `pnpm --filter api prisma:migrate`
- Login/link user melalui **Continue with GitHub**
- Buka `/dashboard/integrations/github`
- Install GitHub App dan pilih repository
- Pastikan installation muncul sebagai Connected
- Sync repositories dan lihat badge `GITHUB` di repository inventory
- Pastikan user tanpa akses organization tidak dapat sync installation
- Pastikan `pnpm lint` dan `pnpm build` berhasil tanpa GitHub secret di CI

Detail target arsitektur jangka panjang tersedia di
[docs/architecture.md](docs/architecture.md).

## Phase 5: Scan Jobs and Worker Foundation

Phase 5 adds protected scan-job APIs, scan history/detail UI, findings and logs
storage, plus a worker skeleton for future VPS scanner execution. Local
development does not require Semgrep, Gitleaks, Trivy, or Docker.

Run the database migration and generate Prisma Client:

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
```

Run services separately:

```bash
pnpm dev:api
pnpm dev:frontend
pnpm dev:worker
```

With `SCAN_WORKER_ENABLED=false`, the worker logs that scan execution is
disabled and does not poll jobs. Connect and sync a GitHub repository, open the
Repositories page, click **Start Scan**, then inspect the pending job in
`/dashboard/scans` and `/dashboard/scans/:id`.

Real scanner execution is intentionally reserved for a future Dockerized worker
on VPS. See [docs/scanner-worker.md](docs/scanner-worker.md) for commands,
environment variables, and security constraints.

Phase 5 introduced the scan-job and worker foundation. Phase 6 extends that
foundation with optional real scanner execution through the Docker worker.

## Phase 6: Dockerized Scanner Worker MVP

Phase 6 enables real worker processing when explicitly configured. The worker
claims pending jobs, creates a short-lived GitHub App installation token, clones
the repository, runs Semgrep/Gitleaks/Trivy, stores normalized findings and
severity counts, writes progress logs, and cleans temporary files.

Local development remains unchanged and does not require scanners:

```env
SCAN_WORKER_ENABLED=false
SCANNER_EXECUTION_MODE="disabled"
```

Build and run the scanner worker:

```bash
docker build -f infra/docker/worker.Dockerfile -t kodeye-worker .
docker compose -f docker-compose.scanner.yml up --build worker
docker compose -f docker-compose.scanner.yml logs -f worker
```

Required Docker worker configuration:

```env
DATABASE_URL="mysql://user:password@host.docker.internal:3306/kodeye"
SCAN_WORKER_ENABLED=true
SCANNER_EXECUTION_MODE="local-cli"
SCAN_WORKER_TEMP_DIR="/tmp/kodeye/scans"
GITHUB_APP_ID=""
GITHUB_APP_PRIVATE_KEY_PATH="/run/secrets/github-app-private-key.pem"
```

Mount the private key read-only into the worker container. Never commit the PEM
file. Prisma Client is generated during the image build; migrations are not run
inside the worker image.

To test, connect and sync a GitHub repository, click **Start Scan**, open the
scan detail page, and watch the worker logs. The job should move from `PENDING`
to `RUNNING`, then `SUCCESS` or `FAILED`. Review scanner logs, findings, counts,
and confirm the temporary scan directory is cleaned.

Troubleshooting:

- A permanently pending job usually means no enabled worker is polling.
- `GitHub installation not found` means the repository organization is not
  connected to a GitHub App installation.
- Clone failures commonly indicate missing repository permission or an invalid
  branch.
- Scanner failure logs identify missing binaries, timeouts, or invalid output.
- Docker-to-host MySQL generally needs `host.docker.internal`.

See [docs/scanner-worker.md](docs/scanner-worker.md) and
[docs/vps-scanner-worker.md](docs/vps-scanner-worker.md).

Phase 6 deliberately excludes payments, subscriptions, PDF reports, GitHub
webhook auto-scan, Check Runs, PR comments, SARIF upload, Redis/BullMQ,
multi-worker orchestration, full production Docker Compose, Kubernetes, AI
explanations, and advanced false-positive workflows.

## Phase 7: Report Generator

Phase 7 adds protected, on-demand security reports for completed or failed scan
jobs. Reports include an objective executive summary, scan metadata, severity
distribution, scanner coverage, sanitized findings, recommendations, and a
short scan-log summary.

Available report formats:

- Dashboard report at `/dashboard/scans/:id/report`
- Printable standalone HTML
- Downloadable JSON without finding `rawJson`
- A4 PDF rendered with Puppeteer

From a scan detail page, open the **Reports** section and choose **View Report**,
**View HTML Report**, **Download PDF**, or **Download JSON**. Pending and running
scans show that the report is not available yet. Failed scans can still produce
an incomplete report with a clear warning.

PDF export intentionally uses `puppeteer-core`, so Chromium is not downloaded
during normal installs or CI builds. Configure the API host:

```env
REPORT_STORAGE_DIR="./tmp/reports"
REPORT_ENABLE_PDF=true
PUPPETEER_EXECUTABLE_PATH="/path/to/chromium"
```

If Chromium is unavailable, HTML and JSON reports still work and PDF export
returns a clear browser-dependency error without crashing the API.

Run Phase 7 locally:

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
pnpm dev:api
pnpm dev:frontend
pnpm lint
pnpm build
```

Reports never include GitHub tokens, private keys, finding `rawJson`, or
unmasked secret evidence. Report HTML escapes repository, finding, and log text
to prevent injected markup.

See [docs/reports.md](docs/reports.md) for report structure, risk calculation,
security notes, limitations, and PDF troubleshooting.

Phase 7 deliberately excludes payments, subscriptions, GitHub webhook
auto-scan, Check Runs, PR comments, SARIF upload, Redis/BullMQ, Kubernetes, full
production deployment, and AI explanations.

## Phase 8: GitHub Webhook Automation and Check Runs

Phase 8 adds the public, signature-protected
`POST /api/github/webhook` endpoint. GitHub push and pull request events can
create deduplicated scan jobs for connected repositories. Repository owners can
enable or disable push and pull request automation from the Repositories page.

Required environment:

```env
GITHUB_APP_WEBHOOK_SECRET=""
GITHUB_CHECK_NAME="Kodeye Security Scan"
GITHUB_WEBHOOK_ENABLED=true
AUTO_SCAN_PUSH_ENABLED=true
AUTO_SCAN_PULL_REQUEST_ENABLED=true
GITHUB_CHECK_DETAILS_BASE_URL="http://localhost:3000/dashboard/scans"
```

The GitHub App needs Metadata read-only and Checks read/write. Approved AI fix
automation additionally needs Contents read/write and Pull requests read/write.
Kodeye keeps repository writes disabled by default through
`AI_GITHUB_WRITE_ENABLED=false`. Subscribe the App to Push, Pull request,
Repository, Installation, and Installation repositories events.

For local webhook testing:

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
pnpm dev:api
pnpm dev:frontend
pnpm dev:worker
ngrok http 3001
```

Set the GitHub App webhook URL to
`https://<ngrok-host>/api/github/webhook`, configure the same webhook secret,
then push to a selected repository or open a pull request. The scan history
shows the trigger, commit, PR number, and GitHub Check link.

The worker updates webhook-created Check Runs when scans start and finish.
Critical/high findings produce a failing check. Other completed scans produce a
successful check with objective wording. A successful automated check does not
guarantee the repository is vulnerability-free.

Invalid signatures return HTTP 401. Check Run permission failures are recorded
as scan warnings without failing the scan. See
[docs/github-automation.md](docs/github-automation.md) for event flows,
deduplication, ngrok testing, VPS notes, security, and troubleshooting.

Phase 8 deliberately excludes payment, subscriptions, PR comments, SARIF,
GitHub Code Scanning integration, Redis/BullMQ, Kubernetes, production
deployment, AI explanations, advanced policy engines, and team billing.

## Phase 9: Advanced Billing with Live Currency

Phase 9 adds Free, Pro, Team, and Enterprise plans; multi-currency pricing;
Frankfurter exchange-rate caching; configurable tax and coupons; Midtrans IDR
checkout; PayPal USD/EUR/SGD checkout and recurring subscriptions; paid invoice
PDFs; admin seed support; and plan-limit enforcement.

Run migration and the idempotent billing seed:

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
pnpm --filter api exec prisma db seed
```

Open `/pricing` for public multi-currency prices and `/dashboard/billing` for
subscription usage, checkout, and invoice history. Payment status from the
frontend is never trusted; subscriptions change only after backend provider
verification. Midtrans supports IDR only, while PayPal supports configured
USD/EUR/SGD currencies.

All payment amounts use integer minor units. Exchange-rate snapshots lock the
checkout and invoice amount. Tax calculations are configurable and must be
reviewed by finance/legal before production. See
[docs/billing.md](docs/billing.md) for architecture, sandbox setup, security,
seed behavior, provider flows, and limitations.

### Admin control center

Run the Prisma seed and sign in at `/login`. In development, when
`ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` are empty, the seed creates:

- Email: `admin@kodeye.local`
- Password: `KodeyeAdmin123!`

Open `/dashboard/admin/billing` to manage plan prices, limits, feature flags,
Midtrans, PayPal, GitHub OAuth/App credentials, webhook automation, callback
URLs, tax, exchange-rate cache, and PDF settings.

Dashboard-managed credentials override environment values, apply without an API
restart, are encrypted at rest, and are returned only as masked values. Set
`SETTINGS_ENCRYPTION_KEY` before production and replace the development
admin account. `DATABASE_URL`, `JWT_SECRET`, and `SETTINGS_ENCRYPTION_KEY`
remain environment-only because they are required during API startup.

Phase 9 deliberately excludes Kubernetes, production deployment, advanced
accounting ledgers, complex tax compliance, automated complex refunds, AI
explanations, SARIF upload, and advanced PR comments.

## Phase 11: Security Hardening and Final QA

Phase 11 hardens tenant authorization, owner-only billing/integration mutation,
report entitlement checks, webhook/payment validation and idempotency, branch
input validation, worker/API log redaction, explicit production CORS, request
IDs, security headers, and local sensitive-route rate limiting.

Run the local smoke checks after starting the API and frontend:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-smoke-test.ps1
```

Review [docs/security/self-audit.md](docs/security/self-audit.md),
[docs/qa/final-qa-checklist.md](docs/qa/final-qa-checklist.md), and
[docs/known-limitations.md](docs/known-limitations.md) before deployment.
Phase 11 deliberately does not create production deployment infrastructure.

## Phase 12: VPS Deployment and Operations

Phase 12 adds production Dockerfiles for frontend, API, and scanner worker;
`docker-compose.prod.yml` with internal MySQL/worker and persistent volumes;
host-level Nginx/Certbot guidance; a safe production env template; backup and
production smoke scripts; plus complete VPS, provider, operations, launch,
rollback, and maintenance documentation.

Quick deployment:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d mysql
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:migrate:deploy
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:seed
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Deployment traffic flows through host Nginx: `kodeye.net` and `app.kodeye.net`
to frontend on loopback port 3000, and `backend.kodeye.net` to API on loopback
port 3001. MySQL and worker remain internal.

Start with [docs/deployment/architecture.md](docs/deployment/architecture.md)
and [docs/deployment/vps-installation.md](docs/deployment/vps-installation.md).
Then follow [DNS](docs/deployment/dns.md), [Nginx](docs/deployment/nginx.md),
[SSL](docs/deployment/ssl-certbot.md), [admin user](docs/deployment/admin-user-setup.md),
[admin settings](docs/deployment/admin-settings-setup.md),
[operations](docs/deployment/running-operations.md),
[Mini Antigravity release deployment](docs/deployment/mini-antigravity-release.md),
[backup/restore](docs/deployment/backup-restore.md),
[troubleshooting](docs/deployment/troubleshooting.md),
[security](docs/deployment/security.md),
[post-deploy checklist](docs/deployment/post-deploy-checklist.md),
[smoke test](docs/deployment/smoke-test.md),
[credential map](docs/provider-setup/credential-map.md),
[launch runbook](docs/launch/launch-runbook.md),
[rollback](docs/launch/rollback.md), and [maintenance](docs/maintenance.md).

Phase 12 targets one VPS with Docker Compose, Nginx, and Certbot. It deliberately
excludes Kubernetes, Helm, Swarm, Terraform, autoscaling, managed databases,
and full CI/CD automation.
