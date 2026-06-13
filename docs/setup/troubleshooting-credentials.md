# Troubleshooting Credentials

GitHub OAuth callback mismatch:

- Pastikan URL di GitHub OAuth App sama persis dengan `GITHUB_OAUTH_CALLBACK_URL`.
- `localhost` dan `127.0.0.1` dianggap berbeda.

GitHub App installed tapi repo tidak synced:

- Cek installation permission.
- Cek selected repositories.
- Klik sync ulang dari dashboard.

GitHub webhook invalid signature:

- Pastikan `GITHUB_APP_WEBHOOK_SECRET` sama dengan GitHub App webhook secret.
- Update URL tunnel jika ngrok/cloudflared berubah.

GitHub Check Run permission missing:

- Set Checks permission ke Read & write.

Midtrans pending forever:

- Notification URL harus public.
- Jangan percaya status frontend.
- Cek sandbox/live key.

PayPal invalid client credentials:

- Pastikan `PAYPAL_ENVIRONMENT` cocok dengan sandbox/live credential.

PayPal webhook verification failed:

- Pastikan `PAYPAL_WEBHOOK_ID` cocok dengan webhook yang menerima event.

PayPal unsupported currency:

- Gunakan `USD`, `EUR`, atau `SGD` sesuai `PAYPAL_SUPPORTED_CURRENCIES`.

Currency provider unavailable:

- Cek koneksi.
- Gunakan cached/stale exchange rate jika diizinkan.

Scanner worker tidak memproses:

- Cek `SCAN_WORKER_ENABLED`.
- Cek process worker.
- Cek scanner binaries.

PDF generation failed:

- Cek storage directory writable.
- Cek Chromium/Puppeteer executable.

Settings encryption key invalid:

- `SETTINGS_ENCRYPTION_KEY` harus 32 bytes, hex 64 chars, atau base64 32 bytes.
- Production harus fail fast jika key invalid.

Admin settings saved tapi provider masih pakai env:

- Klik reload settings.
- Pastikan setting aktif dan tidak kosong.
- Cek source di UI: database/environment/default.
