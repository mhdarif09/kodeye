# Admin Settings

Admin Settings adalah runtime override untuk credential dan konfigurasi aplikasi. Precedence:

1. Database setting aktif.
2. Environment variable fallback.
3. Safe default bila tersedia.

Secret disimpan terenkripsi dengan AES-256-GCM. Frontend hanya menerima masked value, bukan decrypted secret.

Env-only, jangan simpan di Admin Settings:

- `DATABASE_URL`
- `JWT_SECRET`
- `SETTINGS_ENCRYPTION_KEY`
- `ADMIN_SEED_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`

Update setting:

1. Login sebagai admin.
2. Buka Dashboard -> Admin -> Settings.
3. Pilih kategori.
4. Edit value.
5. Save.
6. Klik provider test bila relevan.

Replace secret:

1. Paste value baru di field secret.
2. Save.
3. Backend mengenkripsi secret.
4. UI berikutnya hanya menampilkan masked value.

Clear secret:

1. Klik Clear Secret.
2. Secret database dihapus.
3. Resolver kembali memakai env fallback jika ada.
4. Audit log mencatat action `CLEAR_SECRET`.

> Warning: Jangan tampilkan secret di screenshot, log, issue, atau dokumen publik.
