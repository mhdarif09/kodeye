# Midtrans

Midtrans dipakai untuk checkout IDR, Snap token, notification/webhook, dan recurring bila tersedia.

Ambil keys di Midtrans Dashboard -> Settings/Access Keys.

| Midtrans | Kodeye |
| --- | --- |
| Server Key | `MIDTRANS_SERVER_KEY` |
| Client Key | `MIDTRANS_CLIENT_KEY` |
| Merchant ID | `MIDTRANS_MERCHANT_ID` |
| Environment | `MIDTRANS_IS_PRODUCTION` |

Notification URL:

- Local: `https://xxxx.ngrok-free.app/api/payments/midtrans/notification`
- Production: `https://backend.kodeye.net/api/payments/midtrans/notification`

Important:

- Server Key adalah secret.
- Status payment harus dari notification backend, bukan dari frontend.
- Midtrans Phase 10 pakai IDR.

Test:

1. Isi settings.
2. Klik Test Midtrans.
3. Billing -> pilih IDR.
4. Buat Midtrans payment.
5. Selesaikan sandbox payment.
6. Cek payment status dan invoice.

Common errors:

- Sandbox/live key tertukar.
- Notification URL tidak public.
- Ngrok URL berubah.
- Non-IDR dipakai untuk Midtrans.
