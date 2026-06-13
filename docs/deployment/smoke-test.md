# Production Smoke Test

Jalankan setelah DNS, Nginx, dan SSL selesai:

```bash
chmod +x scripts/smoke-test-prod.sh
./scripts/smoke-test-prod.sh
```

Override URL bila perlu:

```bash
LANDING_URL=https://staging.example.com API_HEALTH_URL=https://api.example.com/api/health ./scripts/smoke-test-prod.sh
```

Script memastikan landing, redirect www, app, API health, dan HTTPS dapat
diakses. Exit non-zero berarti launch harus dihentikan sampai DNS, TLS, Nginx,
container status, dan logs diperiksa. Script ini tidak menggantikan provider
test atau end-to-end payment/scan.
