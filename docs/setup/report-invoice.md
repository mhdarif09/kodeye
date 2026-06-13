# Report dan Invoice

Report/invoice config mengatur PDF generation dan storage path.

Settings:

- `REPORT_STORAGE_DIR`
- `REPORT_ENABLE_PDF`
- `INVOICE_STORAGE_DIR`
- `INVOICE_PDF_ENABLED`

Catatan:

- PDF generation mungkin butuh Chromium dependencies.
- Generated files jangan di-commit.
- Storage directory production harus persistent.

Test:

1. Open scan report.
2. Download PDF.
3. Open billing invoice.
4. Download invoice PDF.

Common errors:

- Directory tidak writable.
- Chromium/Puppeteer dependency missing.
- PDF blank.
- Invoice belum dibuat karena payment belum paid.
