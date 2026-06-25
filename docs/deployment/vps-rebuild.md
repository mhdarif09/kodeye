# VPS Rebuild Notes

Panduan singkat untuk rebuild Kodeye di VPS setelah perubahan frontend, Meta Pixel, atau Conversions API.

## Environment Frontend

Pastikan environment frontend punya value berikut:

```bash
NEXT_PUBLIC_API_URL="https://kodeye.net/api"
NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/6283896895536"
META_PIXEL_ID="1775848800523906"
META_CONVERSIONS_API_TOKEN="isi_token_dari_meta_events_manager"
META_GRAPH_API_VERSION="v23.0"
```

`META_CONVERSIONS_API_TOKEN` wajib hanya ada di server/VPS. Jangan commit token ke Git.

Opsional untuk testing dari Meta Events Manager:

```bash
META_TEST_EVENT_CODE="TESTxxxxx"
```

Hapus lagi `META_TEST_EVENT_CODE` setelah testing production selesai.

## Rebuild Dengan Docker Compose

```bash
git pull origin main
docker compose build frontend
docker compose up -d frontend
docker compose ps
docker compose logs -f frontend
```

Jika API ikut berubah:

```bash
docker compose build api frontend
docker compose up -d api frontend
docker compose logs -f api frontend
```

## Rebuild Tanpa Docker

```bash
git pull origin main
pnpm install --frozen-lockfile
pnpm --filter @kodeye/frontend build
pm2 restart kodeye-frontend
pm2 logs kodeye-frontend
```

Sesuaikan nama process PM2 dengan process yang dipakai di VPS.

## Verifikasi Setelah Deploy

1. Buka `https://kodeye.net`.
2. Cek Meta Pixel Helper: `PageView` dan `ViewContent` harus muncul.
3. Klik tombol WhatsApp: event `Contact` harus muncul.
4. Submit form contact sales: event `CompleteRegistration` harus muncul.
5. Jika testing CAPI, cek Events Manager bagian Test Events.

## Catatan Keamanan

- Rotate token Meta Conversions API kalau token pernah terkirim lewat chat atau kanal tidak aman.
- Token CAPI tidak boleh diawali `NEXT_PUBLIC_`.
- Jangan tampilkan token di browser, HTML, log publik, atau screenshot.
