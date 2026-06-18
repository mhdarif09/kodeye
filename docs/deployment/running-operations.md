# Running dan Operasi

Semua command dijalankan dari `/opt/kodeye`.

Untuk release yang tinggal `git pull` dan rebuild di VPS yang sudah jalan, lihat
[`pull-and-rebuild.md`](./pull-and-rebuild.md).

```bash
# Start / stop / restart / status
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml down
docker compose --env-file .env.production -f docker-compose.prod.yml restart
docker compose --env-file .env.production -f docker-compose.prod.yml ps

# Rebuild
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d

# Logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f worker
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f mysql

# Migration / seed
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:migrate:deploy
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:seed

# Shell container
docker compose --env-file .env.production -f docker-compose.prod.yml exec api sh
docker compose --env-file .env.production -f docker-compose.prod.yml exec mysql sh

# Health
curl http://127.0.0.1:3001/api/health
curl https://backend.kodeye.net/api/health
```

`pnpm deploy:*` menyediakan shortcut untuk operasi umum.
