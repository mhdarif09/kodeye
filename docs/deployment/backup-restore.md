# Backup dan Restore

## Backup

```bash
cd /opt/kodeye
chmod +x scripts/backup-mysql.sh
./scripts/backup-mysql.sh
```

Backup terkompresi disimpan ke `backups/mysql/kodeye_YYYYMMDD_HHMMSS.sql.gz`
dan diabaikan Git. Salin keluar VPS ke storage terenkripsi/offsite:

```bash
scp /opt/kodeye/backups/mysql/kodeye_*.sql.gz user@backup-host:/secure/path/
```

Cron harian pukul 02:00:

```cron
0 2 * * * /opt/kodeye/scripts/backup-mysql.sh >> /var/log/kodeye-backup.log 2>&1
```

## Restore

Restore menimpa/menggabungkan data database target. Stop API/worker, buat backup
baru, dan pastikan file benar sebelum melanjutkan:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml stop api worker
gunzip -c backups/mysql/kodeye_TIMESTAMP.sql.gz | \
  docker compose --env-file .env.production -f docker-compose.prod.yml exec -T mysql \
  sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
docker compose --env-file .env.production -f docker-compose.prod.yml start api worker
```

Uji restore secara berkala pada lingkungan terpisah.
