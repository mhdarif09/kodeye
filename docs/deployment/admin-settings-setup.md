# Setup Admin Settings Setelah Deploy

Login sebagai admin lalu buka
`https://app.kodeye.net/dashboard/admin/settings`. Secret akan tampil masked;
jangan menyalinnya ke chat atau log. Setelah perubahan, gunakan reload settings
atau restart API bila provider belum membaca nilai baru.

## 1. App URLs

| Key                               | Value                                                              |
| --------------------------------- | ------------------------------------------------------------------ |
| `APP_URL`                         | `https://app.kodeye.net`                                           |
| `LANDING_URL` / `PUBLIC_SITE_URL` | `https://kodeye.net`                                               |
| `FRONTEND_URL`                    | `https://app.kodeye.net`                                           |
| `API_URL`                         | `https://backend.kodeye.net`                                       |
| `CORS_ORIGIN`                     | `https://kodeye.net,https://www.kodeye.net,https://app.kodeye.net` |
| `PAYMENT_SUCCESS_URL`             | `https://app.kodeye.net/dashboard/billing?status=success`          |
| `PAYMENT_PENDING_URL`             | `https://app.kodeye.net/dashboard/billing?status=pending`          |
| `PAYMENT_ERROR_URL`               | `https://app.kodeye.net/dashboard/billing?status=error`            |
| `FRONTEND_AUTH_CALLBACK_URL`      | `https://app.kodeye.net/auth/callback`                             |
| `FRONTEND_GITHUB_INTEGRATION_URL` | `https://app.kodeye.net/dashboard/integrations/github`             |

## 2. GitHub OAuth

GitHub -> Settings -> Developer settings -> OAuth Apps. Set homepage
`https://kodeye.net` dan callback
`https://backend.kodeye.net/api/auth/github/callback`. Masukkan Client ID,
Client Secret, dan callback ke `GITHUB_OAUTH_*`. Jalankan Test GitHub lalu coba
Login with GitHub.

## 3. GitHub App

GitHub -> Settings -> Developer settings -> GitHub Apps:

- Homepage: `https://kodeye.net`
- Setup/callback: `https://backend.kodeye.net/api/github/install/callback`
- Webhook: `https://backend.kodeye.net/api/github/webhook`
- Permissions: Metadata read, Contents read, Pull requests read, Checks read/write.
- Events: Push, Pull request, Repository, Installation, Installation repositories.

Isi `GITHUB_APP_ID`, `GITHUB_APP_NAME`, private key PEM, webhook secret, install
URL, callback URL, check name, dan details base URL. Test GitHub, install App,
sync repository, start scan, lalu trigger push/PR.

## 4. Midtrans

Dari Midtrans Dashboard -> Settings/Access Keys, isi server key, client key,
merchant ID, environment, dan notification secret bila digunakan. Notification
URL: `https://backend.kodeye.net/api/payments/midtrans/notification`. Recurring
notification URL dapat disiapkan di
`https://backend.kodeye.net/api/payments/midtrans/recurring/notification`,
namun recurring Midtrans masih terbatas. Test provider, pembayaran sandbox,
status pembayaran, dan invoice.

## 5. PayPal

Dari PayPal Developer Dashboard -> Apps & Credentials, isi environment, client
ID, client secret, webhook ID, dan currencies. Webhook URL:
`https://backend.kodeye.net/api/payments/paypal/webhook`; return/cancel:
`https://app.kodeye.net/payments/paypal/return` dan `/cancel`. Test provider,
order sandbox, capture, dan invoice.

## 6. Billing/Currency

Review `BILLING_TAX_ENABLED`, tax rate/label, default/supported currencies, live
currency provider, cache TTL, dan stale-rate policy. Jalankan Test Currency,
buka pricing, ganti currency, dan validasi tax dengan finance/legal.

## 7. Scanner

Gunakan `SCAN_WORKER_ENABLED=true`, `SCANNER_EXECUTION_MODE=local-cli`,
`SCAN_WORKER_TEMP_DIR=/tmp/kodeye/scans`, dan timeout sesuai kapasitas. Buat scan
job, lihat worker logs, dan konfirmasi scan selesai.

## 8. Report/Invoice

Gunakan `REPORT_STORAGE_DIR=/app/storage/reports`, `REPORT_ENABLE_PDF=true`,
`INVOICE_STORAGE_DIR=/app/storage/invoices`, dan `INVOICE_PDF_ENABLED=true`.
Download report PDF dan invoice PDF sebagai tes akhir.

Terakhir jalankan semua provider test dan alur end-to-end.
