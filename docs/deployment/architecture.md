# Arsitektur Deployment VPS

```text
Internet -> Nginx host -> kodeye.net / www.kodeye.net -> frontend :3000 -> landing page
Internet -> Nginx host -> app.kodeye.net -> frontend :3000 -> app/dashboard/admin/billing
Internet/provider -> Nginx host -> backend.kodeye.net -> api :3001 -> API/OAuth/webhooks

api -> mysql (Docker network internal)
worker -> mysql (Docker network internal)
worker -> GitHub + Semgrep/Gitleaks/Trivy
api -> report_storage + invoice_storage
```

Nginx berjalan di host sebagai satu-satunya pintu masuk HTTP/HTTPS dan meneruskan
traffic ke port frontend/API yang bind ke `127.0.0.1`. Ini memudahkan Certbot,
diagnosis, dan integrasi firewall VPS. Frontend melayani landing page serta
dashboard yang sama; hostname menentukan URL publik yang digunakan pengguna.

MySQL tidak memetakan port host karena database hanya dibutuhkan API dan worker.
Worker tidak memiliki port publik karena hanya polling database dan menghubungi
provider/scanner. Volume `mysql_data`, `report_storage`, dan `invoice_storage`
menyimpan data penting; `worker_tmp` adalah ruang kerja sementara.

Target ini sengaja memakai satu VPS, Docker Compose, Nginx host-level, dan
Certbot untuk MVP. Tidak ada Kubernetes, Helm, Swarm, atau autoscaling.
