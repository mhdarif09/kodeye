# Setup Nginx

Buat `/etc/nginx/sites-available/kodeye`:

```nginx
server {
    listen 80;
    server_name www.kodeye.net;
    return 301 http://kodeye.net$request_uri;
}

server {
    listen 80;
    server_name kodeye.net app.kodeye.net;

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
    listen 80;
    server_name backend.kodeye.net;

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

Setelah Certbot memasang HTTPS, pastikan redirect `www` mengarah permanen ke
`https://kodeye.net$request_uri`, bukan kembali ke HTTP.
