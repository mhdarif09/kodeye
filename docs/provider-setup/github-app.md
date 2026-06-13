# GitHub App Production Setup

Gunakan homepage `https://kodeye.net`, setup/callback
`https://backend.kodeye.net/api/github/install/callback`, dan webhook
`https://backend.kodeye.net/api/github/webhook`. Beri Metadata/Contents/Pull
requests read serta Checks read/write; subscribe Push, Pull request, Repository,
Installation, dan Installation repositories. Masukkan App ID, name, private key
PEM, webhook secret, install/callback URL, check name/details URL ke Admin
Settings. Test install, sync, scan, push, dan PR.

Untuk production Docker, simpan private key sebagai file di host dan mount
read-only ke container API:

```bash
sudo mkdir -p /opt/kodeye/secrets
sudo mv /opt/kodeye/kodeye-local.2026-06-12.private-key.pem /opt/kodeye/secrets/github-app-private-key.pem
sudo chown 1000:1000 /opt/kodeye/secrets/github-app-private-key.pem
sudo chmod 400 /opt/kodeye/secrets/github-app-private-key.pem
```

Isi `.env.production`:

```env
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_PRIVATE_KEY_HOST_PATH=/opt/kodeye/secrets/github-app-private-key.pem
GITHUB_APP_PRIVATE_KEY_PATH=/run/secrets/github-app-private-key.pem
GITHUB_APP_INSTALL_URL=https://github.com/apps/your-github-app-slug/installations/new
GITHUB_APP_CALLBACK_URL=https://backend.kodeye.net/api/github/install/callback
```

`GITHUB_APP_PRIVATE_KEY_HOST_PATH` adalah lokasi file di VPS.
`GITHUB_APP_PRIVATE_KEY_PATH` adalah lokasi file yang terlihat oleh API di dalam
container. Setelah mengubahnya, recreate API:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate api
docker compose --env-file .env.production -f docker-compose.prod.yml exec api test -r /run/secrets/github-app-private-key.pem
```
