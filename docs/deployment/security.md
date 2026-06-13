# Security Deployment

- UFW hanya membuka SSH/22, HTTP/80, dan HTTPS/443.
- MySQL dan worker tidak memiliki port publik.
- Frontend/API hanya bind `127.0.0.1` dan diakses melalui Nginx.
- Gunakan JWT secret, settings encryption key, dan password MySQL yang kuat dan berbeda.
- Simpan `.env.production` dengan mode `600`; jangan commit env atau private key.
- Provider credential boleh dikelola dari Admin Settings setelah bootstrap.
- Rotate semua credential yang bocor dan jaga server/image tetap diperbarui.
- Lindungi backup seperti database production dan batasi retention.
- Jangan memasukkan secret ke image atau log.
- Hapus atau pindahkan private key lokal dari repository tree dan rotate key yang pernah terekspos.
- Worker menjalankan scanner statis, bukan arbitrary build/test/code dari repository.
- Review image/scanner version sebelum update dan batasi resource VPS secara operasional.
