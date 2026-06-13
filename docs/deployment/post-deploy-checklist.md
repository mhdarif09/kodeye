# Post-Deployment Checklist

- [ ] DNS `kodeye.net`, `www`, `app`, dan `backend` mengarah ke VPS.
- [ ] Container mysql, api, frontend, dan worker healthy/running.
- [ ] `sudo nginx -t` sukses; landing/app/API terbuka; www redirect benar.
- [ ] Semua HTTPS valid dan `certbot renew --dry-run` sukses.
- [ ] Admin login, dashboard, settings, dan audit log berfungsi.
- [ ] GitHub OAuth/App, Midtrans, PayPal, billing/currency, scanner, report/invoice terisi.
- [ ] Test GitHub, Midtrans, PayPal, dan Currency sukses.
- [ ] Register/login dan GitHub login sukses.
- [ ] Install GitHub App, sync repository, scan, worker, dan report PDF sukses.
- [ ] Billing sandbox, payment webhook, dan invoice PDF sukses.
- [ ] Backup dibuat, disalin offsite, dan restore test dijadwalkan.
- [ ] Logs diperiksa dan tidak mengandung secret.
