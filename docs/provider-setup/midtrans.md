# Midtrans Production Setup

Ambil Server Key, Client Key, dan Merchant ID dari Midtrans Dashboard. Mulai
dengan sandbox (`MIDTRANS_IS_PRODUCTION=false`) dan notification URL
`https://backend.kodeye.net/api/payments/midtrans/notification`. Masukkan
credential melalui Admin Settings, test provider, buat payment sandbox, lalu
cek callback, status, dan invoice. Jangan mencampur sandbox dan production key.
