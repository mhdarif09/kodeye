# SSL dengan Certbot

Pastikan DNS benar, port 80/443 terbuka, dan `sudo nginx -t` sukses.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kodeye.net -d www.kodeye.net -d app.kodeye.net -d backend.kodeye.net
sudo certbot renew --dry-run
sudo certbot certificates
```

HTTPS wajib untuk OAuth callback, GitHub/payment webhook, login, dan admin.
Setelah instalasi, cek bahwa `www.kodeye.net` redirect permanen ke
`https://kodeye.net` serta semua hostname tidak memiliki certificate warning.
