# GitHub App

GitHub App dipakai untuk repository access, repository selection, webhook automation, dan GitHub Check Run.

Buat di GitHub: Settings -> Developer settings -> GitHub Apps -> New GitHub App.

Local dengan tunnel:

- Backend local: `http://127.0.0.1:3001`
- Public tunnel: `https://xxxx.ngrok-free.app`
- Frontend: `http://localhost:3000`

URLs:

| Field        | Local                                                     | Production                                               |
| ------------ | --------------------------------------------------------- | -------------------------------------------------------- |
| Homepage URL | `http://localhost:3000`                                   | `https://app.kodeye.net`                                 |
| Callback URL | `https://xxxx.ngrok-free.app/api/github/install/callback` | `https://backend.kodeye.net/api/github/install/callback` |
| Setup URL    | `https://xxxx.ngrok-free.app/api/github/install/callback` | `https://backend.kodeye.net/api/github/install/callback` |
| Webhook URL  | `https://xxxx.ngrok-free.app/api/github/webhook`          | `https://backend.kodeye.net/api/github/webhook`          |

Aktifkan **Redirect on update** pada bagian Setup URL agar GitHub juga kembali
ke Kodeye setelah user mengubah pilihan repository pada instalasi yang sudah
ada. Setelah callback sukses, backend mengarahkan user ke
`https://app.kodeye.net/dashboard/integrations/github`.

Permissions:

- Metadata: Read-only
- Contents: Read & write when `AI_GITHUB_WRITE_ENABLED=true`; otherwise
  Read-only is sufficient
- Pull requests: Read & write when `AI_GITHUB_WRITE_ENABLED=true`; otherwise
  Read-only is sufficient
- Checks: Read & write

Events:

- Push
- Pull request
- Repository
- Installation
- Installation repositories

Masukkan ke Admin Settings:

- `GITHUB_APP_ID`
- `GITHUB_APP_NAME`
- `GITHUB_APP_WEBHOOK_SECRET`
- `GITHUB_APP_INSTALL_URL`
- `GITHUB_APP_CALLBACK_URL`
- `GITHUB_WEBHOOK_ENABLED`
- `GITHUB_CHECK_NAME`
- `GITHUB_CHECK_DETAILS_BASE_URL`

Set `GITHUB_APP_PRIVATE_KEY_PATH` from the deployment environment to a mounted
read-only PEM file; it is not managed from Admin Settings.

Test:

1. Klik Test GitHub.
2. Buka Dashboard -> Integrations -> GitHub.
3. Install GitHub App.
4. Sync repository.
5. Buat push/PR dan cek webhook delivery.

Common errors:

- Private key format invalid.
- Webhook secret beda.
- Checks permission belum Read & write.
- Ngrok URL berubah tapi GitHub App masih memakai URL lama.
