# Setup Nginx

Buat `/etc/nginx/sites-available/kodeye`:

```nginx
server {
    listen 80;
    server_name www.kodeye.net kodeye.net app.kodeye.net backend.kodeye.net;
    return 301 https://$host$request_uri;
}

# The HTTPS server blocks created or managed by Certbot proxy to these
# loopback-only upstreams:
server {
    listen 443 ssl http2;
    server_name kodeye.net app.kodeye.net;

    ssl_certificate /etc/letsencrypt/live/kodeye.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kodeye.net/privkey.pem;
    client_max_body_size 20M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}

server {
    listen 443 ssl http2;
    server_name backend.kodeye.net;

    ssl_certificate /etc/letsencrypt/live/backend.kodeye.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/backend.kodeye.net/privkey.pem;
    client_max_body_size 20M;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

Aktifkan dan validasi:

```bash
sudo nano /etc/nginx/sites-available/kodeye
sudo ln -s /etc/nginx/sites-available/kodeye /etc/nginx/sites-enabled/kodeye
sudo nginx -t
sudo systemctl reload nginx
```

Setelah Certbot memasang HTTPS, pastikan semua host HTTP mengarah permanen ke
HTTPS. Production API memakai `REQUIRE_HTTPS=true` dan akan menolak request
publik yang tidak membawa `X-Forwarded-Proto: https`.
