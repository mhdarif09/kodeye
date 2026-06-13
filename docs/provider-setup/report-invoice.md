# Report dan Invoice Storage

API memasang volume ke `/app/storage/reports` dan `/app/storage/invoices`.
Chromium tersedia di `/usr/bin/chromium` untuk PDF. Konfigurasi:

```env
REPORT_STORAGE_DIR=/app/storage/reports
REPORT_ENABLE_PDF=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
INVOICE_STORAGE_DIR=/app/storage/invoices
INVOICE_PDF_ENABLED=true
```

Test download report dan invoice PDF, permission volume, disk usage, dan backup
retention. Database tetap menjadi sumber metadata utama.
