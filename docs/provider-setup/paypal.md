# PayPal Production Setup

Buat app pada PayPal Developer Dashboard. Pilih sandbox saat pengujian, isi
Client ID/Secret, Webhook ID, dan currency. Webhook:
`https://backend.kodeye.net/api/payments/paypal/webhook`; return/cancel berada
di `https://app.kodeye.net/payments/paypal/return` dan `/cancel`. Test provider,
order, capture, duplicate webhook, dan invoice sebelum berpindah ke live.
