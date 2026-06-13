# App Callback URLs

App URL dan callback URL harus cocok dengan dashboard provider.

Local:

| Key | Value |
| --- | --- |
| `APP_URL` | `http://localhost:3000` |
| `FRONTEND_URL` | `http://localhost:3000` |
| `API_URL` | `http://127.0.0.1:3001` |
| `CORS_ORIGIN` | `http://localhost:3000` |
| `GITHUB_OAUTH_CALLBACK_URL` | `http://127.0.0.1:3001/api/auth/github/callback` |
| `GITHUB_APP_CALLBACK_URL` | `https://xxxx.ngrok-free.app/api/github/install/callback` |
| GitHub webhook URL | `https://xxxx.ngrok-free.app/api/github/webhook` |
| `PAYMENT_SUCCESS_URL` | `http://localhost:3000/dashboard/billing?status=success` |
| `PAYMENT_PENDING_URL` | `http://localhost:3000/dashboard/billing?status=pending` |
| `PAYMENT_ERROR_URL` | `http://localhost:3000/dashboard/billing?status=error` |

Production contoh:

| Key | Value |
| --- | --- |
| `APP_URL` | `https://app.kodeye.net` |
| `FRONTEND_URL` | `https://app.kodeye.net` |
| `API_URL` | `https://backend.kodeye.net` |
| `CORS_ORIGIN` | `https://app.kodeye.net` |

Common errors:

- CORS blocked.
- OAuth callback mismatch.
- Webhook tidak diterima.
- Frontend memanggil backend URL yang salah.
