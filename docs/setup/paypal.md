# PayPal

PayPal dipakai untuk checkout internasional dan recurring subscription.

Buat app di PayPal Developer Dashboard -> Apps & Credentials -> Sandbox atau Live -> Create App.

| PayPal | Kodeye |
| --- | --- |
| Client ID | `PAYPAL_CLIENT_ID` |
| Client Secret | `PAYPAL_CLIENT_SECRET` |
| Environment | `PAYPAL_ENVIRONMENT` |
| Webhook ID | `PAYPAL_WEBHOOK_ID` |
| Supported currencies | `PAYPAL_SUPPORTED_CURRENCIES` |

Webhook URL:

- Local: `https://xxxx.ngrok-free.app/api/payments/paypal/webhook`
- Production: `https://backend.kodeye.net/api/payments/paypal/webhook`

Return/cancel:

- `http://localhost:3000/payments/paypal/return`
- `http://localhost:3000/payments/paypal/cancel`

Test:

1. Isi PayPal settings.
2. Klik Test PayPal.
3. Billing -> pilih USD/EUR/SGD.
4. Approve sandbox payment.
5. Verify capture dan invoice.

Common errors:

- Sandbox credential dipakai di live.
- Webhook ID missing.
- Unsupported currency.
- Capture order tidak dipanggil setelah approval.
