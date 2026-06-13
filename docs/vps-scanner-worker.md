# VPS Scanner Worker Setup

This is a basic Phase 6 VPS plan, not final production hardening.

1. Install Docker and Docker Compose.
2. Clone the Kodeye repository.
3. Create a runtime `.env`.
4. Configure MySQL access in `DATABASE_URL`.
5. Set `SCAN_WORKER_ENABLED=true`.
6. Set `SCANNER_EXECUTION_MODE=local-cli`.
7. Configure `GITHUB_APP_ID` and a GitHub App private key.
8. Build and run the worker.
9. Start a scan from the Kodeye dashboard.

```bash
docker compose -f docker-compose.scanner.yml up --build worker
docker compose -f docker-compose.scanner.yml logs -f worker
```

If MySQL runs directly on the VPS host:

```env
DATABASE_URL="mysql://user:password@host.docker.internal:3306/kodeye"
```

For private key files, mount the PEM file into the worker container and set:

```env
GITHUB_APP_PRIVATE_KEY_PATH="/run/secrets/kodeye-github-app.pem"
```

Do not bake `.env` or private keys into the image. Apply Prisma migrations from
the API/admin environment before starting the worker. Phase 6 does not include
SSL, nginx, Kubernetes, full production Compose, backups, or monitoring.
