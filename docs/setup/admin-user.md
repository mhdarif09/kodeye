# Admin User

Admin user dibuat lewat Prisma seed.

Env:

| Key | Keterangan |
| --- | --- |
| `ADMIN_SEED_EMAIL` | Email admin. |
| `ADMIN_SEED_PASSWORD` | Password admin, di-hash dengan bcrypt. |
| `ADMIN_SEED_NAME` | Nama admin, default `Kodeye Admin`. |
| `ADMIN_SEED_OVERWRITE` | Set `true` hanya jika ingin overwrite password admin yang sudah ada. |

Command:

```powershell
pnpm --filter api prisma:seed
```

Behavior:

- Password tidak diprint ke console.
- Existing password tidak dioverwrite kecuali `ADMIN_SEED_OVERWRITE=true`.
- User yang sudah ada akan dipromote ke role `ADMIN`.
- Di local development repo ini juga menyediakan dummy admin `admin@kodeye.local` / `KodeyeAdmin123!`.

Login:

1. Buka frontend login page.
2. Login dengan email/password admin.
3. Menu Admin muncul di sidebar.
