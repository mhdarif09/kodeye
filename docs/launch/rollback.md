# Rollback

Rollback ketika release menyebabkan outage, korupsi/data leak risk, kegagalan
auth/payment, atau scan tidak aman. Ambil backup dan dokumentasikan kondisi.

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
git log --oneline
git checkout <previous-tag-or-commit>
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Database rollback berisiko karena kode lama mungkin tidak kompatibel dengan
schema/data baru. Jangan menjalankannya tanpa backup dan review migration.
Untuk restore, stop API/worker dan ikuti
[backup-restore.md](../deployment/backup-restore.md), lalu jalankan smoke dan
integrity checks sebelum membuka traffic kembali.
