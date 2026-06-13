# GitHub OAuth

GitHub OAuth dipakai untuk "Login with GitHub".

Buat di GitHub: Settings -> Developer settings -> OAuth Apps -> New OAuth App.

Local:

| Field | Value |
| --- | --- |
| Application name | Kodeye Local OAuth |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://127.0.0.1:3001/api/auth/github/callback` |

Production contoh:

| Field | Value |
| --- | --- |
| Homepage URL | `https://app.kodeye.net` |
| Authorization callback URL | `https://backend.kodeye.net/api/auth/github/callback` |

Masukkan ke Admin Settings:

| GitHub | Kodeye |
| --- | --- |
| Client ID | `GITHUB_OAUTH_CLIENT_ID` |
| Client Secret | `GITHUB_OAUTH_CLIENT_SECRET` |
| Authorization callback URL | `GITHUB_OAUTH_CALLBACK_URL` |

Test:

1. Klik Test GitHub.
2. Buka login page.
3. Klik Continue with GitHub.

Common errors:

- Callback URL mismatch.
- `localhost` dan `127.0.0.1` tidak sama persis.
- Client secret salah.
- Credential sandbox/local/prod tertukar.
