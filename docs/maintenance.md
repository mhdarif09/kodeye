# Maintenance

- Backup database sebelum update dan simpan salinan offsite.
- Pull release yang disetujui, rebuild container, jalankan migration deploy, lalu smoke test.
- Seed aman/idempotent, tetapi review `ADMIN_SEED_OVERWRITE` sebelum menjalankan.
- Uji restore berkala dan bersihkan backup lama sesuai retention.
- Rotate JWT/provider/MySQL secret terencana; settings encryption key memerlukan prosedur migrasi/re-enkripsi.
- Jalankan `certbot renew --dry-run` dan cek certificate.
- Cek `df -h`, `docker system df`, volume storage, dan ukuran log.
- Restart worker dan periksa Trivy DB/scanner version bila scan bermasalah.
- Update provider credential dari Admin Settings dan jalankan provider test.
- Periksa report/invoice storage, payment webhook status, API/worker logs, dan admin audit logs.
- Jangan menghapus volume atau menjalankan Docker prune tanpa backup dan review.
