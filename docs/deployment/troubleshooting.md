# Troubleshooting Deployment

Mulai dari:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f worker
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f mysql
sudo nginx -t
sudo systemctl status nginx
sudo certbot certificates
sudo ufw status
```

| Masalah                                   | Pemeriksaan dan tindakan                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Docker build gagal                        | Cek disk/RAM/network, log stage gagal, dan `docker compose ... build --no-cache <service>`.        |
| Prisma client belum generated             | Rebuild API/worker; jalankan `pnpm --filter @kodeye/api prisma:generate` di container build/debug. |
| API tidak terhubung MySQL                 | Samakan `DATABASE_URL` dengan `MYSQL_*`, hostname harus `mysql`, cek health/log MySQL.             |
| Migration gagal                           | Backup, cek status DB/log, gunakan `prisma:migrate:deploy`, jangan `migrate dev`.                  |
| Admin seed tidak dibuat                   | Isi `ADMIN_SEED_*`, cek seed logs; gunakan overwrite hanya untuk reset yang disengaja.             |
| Nginx 502                                 | Cek container/health dan `curl 127.0.0.1:3000` / `:3001/api/health`.                               |
| Certbot gagal                             | Pastikan DNS, port 80/443, firewall, dan `nginx -t` benar.                                         |
| DNS salah                                 | Cek `nslookup` seluruh hostname dan tunggu TTL.                                                    |
| GitHub OAuth callback mismatch            | Samakan callback GitHub dengan `https://backend.kodeye.net/api/auth/github/callback`.              |
| GitHub App callback error                 | Cek setup state, App ID/private key, callback/install URL, dan waktu server.                       |
| Webhook signature invalid                 | Samakan webhook secret dan jangan ubah raw request body di proxy.                                  |
| Check Run permission missing              | Beri Checks read/write lalu reinstall/update GitHub App.                                           |
| Worker gagal clone                        | Cek installation access, repository selection, branch, Git, DNS, dan worker logs.                  |
| Scanner missing                           | Masuk worker dan jalankan `semgrep --version`, `gitleaks version`, `trivy --version`.              |
| Trivy DB lambat/gagal                     | Cek internet/disk worker, ulangi kemudian, pertimbangkan cache volume setelah review.              |
| PDF gagal                                 | Cek Chromium dan `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` pada API.                           |
| Storage tidak writable                    | Cek volume mount dan permission `/app/storage/reports` serta `/app/storage/invoices`.              |
| Midtrans pending terus                    | Cek notification URL HTTPS, signature, environment/key, amount/currency, dan API logs.             |
| Midtrans key salah environment            | Sandbox key harus bersama `MIDTRANS_IS_PRODUCTION=false`; production sebaliknya.                   |
| PayPal invalid credentials                | Samakan sandbox/live environment dan credential dari app yang sama.                                |
| PayPal webhook gagal                      | Cek webhook ID, URL, environment, headers, dan event delivery PayPal.                              |
| PayPal currency unsupported               | Gunakan USD/EUR/SGD yang dikonfigurasi.                                                            |
| Currency provider unavailable             | Cek internet/API provider; gunakan stale-rate policy hanya sesuai kebijakan.                       |
| CORS error                                | Pastikan origin app/landing ada persis di `CORS_ORIGIN`, lalu reload settings/API.                 |
| Frontend tidak mencapai backend           | Cek `NEXT_PUBLIC_API_URL` saat image frontend dibuild, DNS, TLS, CORS, dan API health.             |
| Admin setting tersimpan tapi env terpakai | Cek source setting, klik reload settings, lalu restart API bila perlu.                             |
| Encryption key invalid                    | Gunakan key 32-byte hex/base64 yang sama; kehilangan key membuat secret DB tak terbaca.            |
| Backup gagal                              | Cek MySQL running, disk, permission folder, env file, lalu jalankan script manual.                 |

Jangan menempelkan raw secret atau provider payload sensitif saat meminta bantuan.
