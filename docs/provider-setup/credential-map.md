# Production Credential and Setting Map

Admin page: `https://app.kodeye.net/dashboard/admin/settings`. Secret tetap
masked. Nilai env-only seperti database/JWT/settings-encryption tidak dikelola
dari halaman ini.

| Setting Key                      | Category     | Secret? | Where To Get         | Example                                          | Admin Settings Page | Used For                | Test Method       |
| -------------------------------- | ------------ | ------- | -------------------- | ------------------------------------------------ | ------------------- | ----------------------- | ----------------- |
| `GITHUB_OAUTH_CLIENT_ID`         | GitHub OAuth | No      | GitHub OAuth App     | `Iv1...`                                         | GitHub OAuth        | OAuth login             | Test GitHub/login |
| `GITHUB_OAUTH_CLIENT_SECRET`     | GitHub OAuth | Yes     | GitHub OAuth App     | masked                                           | GitHub OAuth        | OAuth token             | Test GitHub/login |
| `GITHUB_OAUTH_CALLBACK_URL`      | GitHub OAuth | No      | Deployment URL       | `https://backend.../api/auth/github/callback`    | GitHub OAuth        | OAuth callback          | Login             |
| `GITHUB_APP_ID`                  | GitHub App   | No      | GitHub App           | `12345`                                          | GitHub App          | App auth                | Test GitHub       |
| `GITHUB_APP_NAME`                | GitHub App   | No      | GitHub App           | `kodeye`                                         | GitHub App          | Install URL             | Install App       |
| `GITHUB_APP_PRIVATE_KEY_PATH`    | GitHub App   | No      | Deployment mount     | `/run/secrets/github-app-private-key.pem`        | Env only            | Installation token      | Sync repo         |
| `GITHUB_APP_WEBHOOK_SECRET`      | GitHub App   | Yes     | Generated/GitHub App | masked                                           | GitHub App          | Webhook signature       | Deliver webhook   |
| `GITHUB_APP_INSTALL_URL`         | GitHub App   | No      | GitHub App slug      | `https://github.com/apps/.../installations/new`  | GitHub App          | Installation            | Install App       |
| `GITHUB_APP_CALLBACK_URL`        | GitHub App   | No      | Deployment URL       | `https://backend.../api/github/install/callback` | GitHub App          | Setup callback          | Install App       |
| `GITHUB_WEBHOOK_ENABLED`         | GitHub App   | No      | Policy               | `true`                                           | GitHub App          | Automation              | Push              |
| `GITHUB_CHECK_NAME`              | GitHub App   | No      | Product choice       | `Kodeye Security Scan`                           | GitHub App          | Check Run               | Push/PR           |
| `GITHUB_CHECK_DETAILS_BASE_URL`  | GitHub App   | No      | Deployment URL       | `https://app.../dashboard/scans`                 | GitHub App          | Check link              | Open Check        |
| `MIDTRANS_IS_PRODUCTION`         | Midtrans     | No      | Environment          | `false`                                          | Midtrans            | API environment         | Test Midtrans     |
| `MIDTRANS_SERVER_KEY`            | Midtrans     | Yes     | Midtrans access keys | masked                                           | Midtrans            | Server API/signature    | Test/payment      |
| `MIDTRANS_CLIENT_KEY`            | Midtrans     | Yes     | Midtrans access keys | masked                                           | Midtrans            | Checkout                | Payment           |
| `MIDTRANS_MERCHANT_ID`           | Midtrans     | No      | Midtrans dashboard   | `G123...`                                        | Midtrans            | Merchant identity       | Test Midtrans     |
| `MIDTRANS_NOTIFICATION_SECRET`   | Midtrans     | Yes     | Generated/provider   | masked                                           | Midtrans            | Notification validation | Callback          |
| `PAYPAL_ENVIRONMENT`             | PayPal       | No      | Environment          | `sandbox`                                        | PayPal              | API environment         | Test PayPal       |
| `PAYPAL_CLIENT_ID`               | PayPal       | Yes     | PayPal app           | masked                                           | PayPal              | API auth                | Test/order        |
| `PAYPAL_CLIENT_SECRET`           | PayPal       | Yes     | PayPal app           | masked                                           | PayPal              | API auth                | Test/order        |
| `PAYPAL_WEBHOOK_ID`              | PayPal       | Yes     | PayPal webhook       | masked                                           | PayPal              | Webhook verification    | Deliver event     |
| `PAYPAL_SUPPORTED_CURRENCIES`    | PayPal       | No      | Billing policy       | `USD,EUR,SGD`                                    | PayPal              | Checkout currencies     | Pricing/order     |
| `BILLING_TAX_ENABLED`            | Billing      | No      | Finance policy       | `true`                                           | Billing             | Tax calculation         | Quote             |
| `BILLING_DEFAULT_TAX_RATE`       | Billing      | No      | Finance/legal        | `0.11`                                           | Billing             | Tax calculation         | Quote/invoice     |
| `BILLING_TAX_LABEL`              | Billing      | No      | Finance/legal        | `PPN`                                            | Billing             | Invoice label           | Invoice           |
| `BILLING_DEFAULT_CURRENCY`       | Billing      | No      | Product policy       | `IDR`                                            | Billing             | Default pricing         | Pricing           |
| `BILLING_SUPPORTED_CURRENCIES`   | Billing      | No      | Product policy       | `IDR,USD,EUR,SGD`                                | Billing             | Currency selector       | Pricing           |
| `BILLING_USE_LIVE_CURRENCY`      | Billing      | No      | Product policy       | `true`                                           | Billing             | FX                      | Test Currency     |
| `BILLING_EXCHANGE_RATE_PROVIDER` | Billing      | No      | Provider choice      | `frankfurter`                                    | Billing             | FX                      | Test Currency     |
| `SCAN_WORKER_ENABLED`            | Scanner      | No      | Deployment policy    | `true`                                           | Scanner             | Worker processing       | Start scan        |
| `SCAN_WORKER_TEMP_DIR`           | Scanner      | No      | Docker volume path   | `/tmp/kodeye/scans`                              | Scanner             | Clone workspace         | Worker logs       |
| `SCANNER_EXECUTION_MODE`         | Scanner      | No      | Deployment policy    | `local-cli`                                      | Scanner             | Scanner execution       | Start scan        |
| `SCANNER_TIMEOUT_MS`             | Scanner      | No      | Capacity policy      | `300000`                                         | Scanner             | Command timeout         | Slow scan         |
| `REPORT_STORAGE_DIR`             | Report       | No      | Docker volume path   | `/app/storage/reports`                           | Report              | Report storage          | Download report   |
| `REPORT_ENABLE_PDF`              | Report       | No      | Product policy       | `true`                                           | Report              | PDF export              | Download PDF      |
| `INVOICE_STORAGE_DIR`            | Invoice      | No      | Docker volume path   | `/app/storage/invoices`                          | Invoice             | Invoice storage         | Download invoice  |
| `INVOICE_PDF_ENABLED`            | Invoice      | No      | Product policy       | `true`                                           | Invoice             | PDF export              | Download PDF      |
| `APP_URL`                        | App URL      | No      | Deployment domain    | `https://app.kodeye.net`                         | App URLs            | App links               | Open app          |
| `LANDING_URL`                    | App URL      | No      | Deployment domain    | `https://kodeye.net`                             | App URLs            | Landing links           | Open landing      |
| `FRONTEND_URL`                   | App URL      | No      | Deployment domain    | `https://app.kodeye.net`                         | App URLs            | Redirect/CORS default   | Login             |
| `API_URL`                        | App URL      | No      | Deployment domain    | `https://backend.kodeye.net`                     | App URLs            | Backend links           | Health            |
| `CORS_ORIGIN`                    | App URL      | No      | Allowed domains      | comma-separated origins                          | App URLs            | Browser API access      | Browser request   |
| `PAYMENT_SUCCESS_URL`            | Payment URL  | No      | App route            | billing success URL                              | App URLs            | Provider redirect       | Payment success   |
| `PAYMENT_PENDING_URL`            | Payment URL  | No      | App route            | billing pending URL                              | App URLs            | Provider redirect       | Pending payment   |
| `PAYMENT_ERROR_URL`              | Payment URL  | No      | App route            | billing error URL                                | App URLs            | Provider redirect       | Failed payment    |
