# Setup DNS

Buat record berikut pada DNS provider:

| Name               | Type  | Target        |
| ------------------ | ----- | ------------- |
| `kodeye.net` / `@` | A     | IP publik VPS |
| `www`              | CNAME | `kodeye.net`  |
| `app`              | A     | IP publik VPS |
| `backend`          | A     | IP publik VPS |

Tunggu propagasi sesuai TTL, lalu cek:

```bash
nslookup kodeye.net
nslookup www.kodeye.net
nslookup app.kodeye.net
nslookup backend.kodeye.net
```

`ping` dapat dipakai sebagai cek tambahan, tetapi sebagian VPS memblokir ICMP.
Jangan menjalankan Certbot sebelum seluruh hostname mengarah ke IP VPS.
