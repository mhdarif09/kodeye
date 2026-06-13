# Launch Runbook

## Pre-launch

- DNS siap; server, Docker, Nginx, env production, dan secret siap.
- Migration/admin seed/provider credential direview.
- Backup script diuji dan rollback owner ditentukan.

## Launch

1. `git pull` atau checkout release tag yang disetujui.
2. Build images: `pnpm deploy:build`.
3. Start MySQL: `docker compose --env-file .env.production -f docker-compose.prod.yml up -d mysql`.
4. Run `pnpm deploy:migrate`.
5. Run `pnpm deploy:seed`.
6. Start services: `pnpm deploy:up`.
7. Setup/validasi Nginx.
8. Setup/validasi SSL.
9. Login admin dan konfigurasi Admin Settings.
10. Test seluruh provider.
11. Jalankan `scripts/smoke-test-prod.sh`.
12. Jalankan end-to-end login, GitHub, scan/report, dan billing/invoice.
13. Monitor API, frontend, worker, MySQL, webhook, dan audit logs.

## Post-launch

Periksa logs, worker queue, payment webhook, backup, admin audit log, disk, dan
catat semua issue beserta keputusan rollback/fix-forward.
