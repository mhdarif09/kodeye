# Kodeye Architecture

## Current Scope

PHASE 1 membangun fondasi teknis Kodeye:

- pnpm monorepo dan struktur workspace
- aplikasi frontend Next.js
- backend API NestJS dengan health check independen dari database
- worker Node.js TypeScript yang dapat dijalankan secara lokal
- package shared untuk type dan constant umum
- konfigurasi MySQL melalui Prisma tanpa schema bisnis
- linting, formatting, build, local development, dan CI basic

PHASE 2 menambahkan backend core:

- schema awal Prisma untuk users, organizations, memberships, dan repositories
- JWT authentication dan role-based access control dasar
- modul users, organizations, dan repository metadata manual
- global validation, response interceptor, safe exception filter, dan Swagger

PHASE 3 menambahkan frontend core yang terhubung ke backend. PHASE 4
menambahkan GitHub OAuth untuk identity/login dan GitHub App installation untuk
akses repository yang dipilih user. OAuth token user dan installation access
token tidak disimpan permanen.

Tidak ada repository cloning, scanner, payment, queue, report generator,
GitHub push/pull request automation, Docker, atau deployment pada phase ini.

## Current Components

### Frontend

`apps/frontend` adalah aplikasi Next.js yang menjadi permukaan pengguna Kodeye.
Pada PHASE 1 aplikasi hanya menampilkan landing page sederhana.

### API

`apps/api` adalah aplikasi NestJS. Endpoint `GET /health` digunakan untuk
memastikan proses API aktif dan tidak melakukan pemeriksaan koneksi database.

### Worker

`apps/worker` adalah proses Node.js TypeScript terpisah. Saat ini worker hanya
melakukan startup dan menulis status proses ke console.

### Shared Package

`packages/shared` menyimpan type dan constant teknis yang aman untuk digunakan
lintas service. Package ini belum berisi business logic.

### Database Foundation

MySQL adalah database target. Prisma dikonfigurasi melalui `DATABASE_URL` dan
memiliki schema backend core. Migration dijalankan manual dan tidak menjadi
bagian startup API atau CI.

## Target Long-Term Architecture

Arsitektur jangka panjang direncanakan memiliki:

- frontend Next.js
- backend API NestJS
- worker service
- database MySQL
- integrasi GitHub App
- scanner lokal menggunakan Semgrep, Gitleaks, dan Trivy
- payment dengan Midtrans dan PayPal
- report generator HTML, PDF, dan JSON
- CI/CD untuk lint, build, test, dan deployment saat phase production

Komponen jangka panjang tersebut hanya menjadi arah arsitektur dan belum
diimplementasikan pada PHASE 1.
