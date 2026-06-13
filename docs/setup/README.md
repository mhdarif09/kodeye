# Setup Kodeye

Dokumen ini adalah pintu masuk setup credential Kodeye untuk Phase 10: Admin Console + Secure Runtime Settings.

Urutan setup yang disarankan:

1. Set env-only secrets: `DATABASE_URL`, `JWT_SECRET`, `SETTINGS_ENCRYPTION_KEY`.
2. Jalankan migration Prisma.
3. Jalankan seed admin.
4. Login ke dashboard sebagai admin.
5. Isi App URL dan callback URL.
6. Isi GitHub OAuth.
7. Isi GitHub App.
8. Isi Midtrans.
9. Isi PayPal.
10. Isi billing/currency.
11. Isi scanner/report/invoice bila perlu.
12. Klik provider test.
13. Jalankan end-to-end test login, sync repo, scan, checkout, invoice.

> Warning: Jangan commit secret. Secret provider harus masuk lewat environment atau Admin Settings terenkripsi.

Dokumen detail:

- [Admin user](./admin-user.md)
- [Admin settings](./admin-settings.md)
- [GitHub OAuth](./github-oauth.md)
- [GitHub App](./github-app.md)
- [Midtrans](./midtrans.md)
- [PayPal](./paypal.md)
- [Billing dan currency](./billing-currency.md)
- [Scanner](./scanner.md)
- [Report dan invoice](./report-invoice.md)
- [App callback URLs](./app-callback-urls.md)
- [Credential map](./credential-map.md)
- [Troubleshooting credentials](./troubleshooting-credentials.md)
