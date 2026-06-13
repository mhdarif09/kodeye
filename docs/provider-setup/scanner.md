# Scanner Worker Setup

Worker production image berisi Git, Semgrep, Gitleaks, dan Trivy serta memakai
`/tmp/kodeye/scans`. Aktifkan worker dan `local-cli`, lalu cek:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec worker git --version
docker compose --env-file .env.production -f docker-compose.prod.yml exec worker semgrep --version
docker compose --env-file .env.production -f docker-compose.prod.yml exec worker gitleaks version
docker compose --env-file .env.production -f docker-compose.prod.yml exec worker trivy --version
```

Buat scan job dan pantau worker logs. Worker tidak boleh menjalankan arbitrary
build/test dari repository.
