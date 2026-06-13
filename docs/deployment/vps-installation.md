# Instalasi VPS dari Nol

## Prasyarat

- Ubuntu 22.04 atau 24.04, domain sudah mengarah ke VPS.
- Rekomendasi awal: 4 vCPU, RAM 8 GB, disk 80 GB; scanner dapat membutuhkan lebih.
- Akses sudo, Git repository, Docker, Nginx host-level, dan Certbot.
- Deployment ini tidak memakai Kubernetes.

## Instalasi server

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip nginx certbot python3-certbot-nginx ufw ca-certificates

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
docker --version
docker compose version

sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

Untuk lingkungan dengan kebijakan ketat, gunakan repository apt resmi Docker
alih-alih convenience script dan review script tersebut sebelum menjalankannya.

## Clone dan konfigurasi

```bash
sudo mkdir -p /opt/kodeye
sudo chown -R "$USER:$USER" /opt/kodeye
git clone <repo-url> /opt/kodeye
cd /opt/kodeye
cp .env.production.example .env.production
nano .env.production
chmod 600 .env.production
```

Generate secret berbeda untuk `JWT_SECRET`, `SETTINGS_ENCRYPTION_KEY`,
`MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `GITHUB_APP_WEBHOOK_SECRET`, dan
opsional `MIDTRANS_NOTIFICATION_SECRET`:

```bash
openssl rand -base64 32
openssl rand -hex 32
```

Pastikan password yang ditulis dalam `DATABASE_URL` sama dengan
`MYSQL_PASSWORD`. URL-encode karakter khusus pada password URL.

## Build, migrasi, seed, dan start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d mysql
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:migrate:deploy
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:seed
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

`prisma migrate deploy` dipakai di production; jangan memakai `migrate dev`.

Jika build sebelumnya gagal saat mengunduh scanner worker, tarik perubahan terbaru
dan build ulang worker tanpa cache sebelum melanjutkan:

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml build --no-cache worker
docker compose --env-file .env.production -f docker-compose.prod.yml build
```

## Verifikasi

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f worker
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1:3000
```

Lanjutkan ke DNS, Nginx, dan Certbot. Jangan membuka port 3000, 3001, atau 3306
di firewall publik.
