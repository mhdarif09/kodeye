# Setup Admin User

Isi `.env.production` sebelum seed:

```env
ADMIN_SEED_EMAIL=admin@kodeye.net
ADMIN_SEED_PASSWORD=strong_password_here
ADMIN_SEED_NAME=Kodeye Admin
ADMIN_SEED_OVERWRITE=false
```

Jalankan:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api pnpm --filter @kodeye/api prisma:seed
```

Login di `https://app.kodeye.net/login`, lalu buka Dashboard -> Admin. Password
tidak disimpan plaintext. Jangan commit password atau memakai password lemah.
Setelah seed sukses, `ADMIN_SEED_PASSWORD` boleh dikosongkan. Jangan mengaktifkan
`ADMIN_SEED_OVERWRITE=true` kecuali memang ingin mereset password admin.
