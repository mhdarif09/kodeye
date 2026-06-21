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
- Set `REQUIRE_HTTPS=true`; semua traffic publik harus memakai TLS dan HTTP harus redirect ke HTTPS.
- Set `API_DOCS_ENABLED=false` untuk production kecuali dokumentasi API dibatasi di network internal.
- Set `API_MAX_BODY_BYTES=1048576` atau lebih kecil sesuai kebutuhan endpoint agar request besar ditolak lebih awal.
- API sekarang menolak unsafe cross-origin requests yang membawa `Origin` di luar `CORS_ORIGIN`.
- Frontend mengirim security headers termasuk CSP, frame denial, no-sniff, referrer policy, COOP, dan CORP.
- Auth registration wajib password kuat: huruf kecil, huruf besar, angka, dan simbol.

## OWASP/CWE Coverage Notes

Kodeye hardening saat ini menargetkan risiko umum berikut:

- A01 Broken Access Control / CWE-22, CWE-284: workspace path traversal guard, symlink guard, organization access checks.
- A02 Cryptographic Failures / CWE-798: scanner secret redaction dan larangan raw secret evidence.
- A03 Injection / CWE-79, CWE-89, CWE-78: DTO validation, shell-less scanner runner, AI fix prompt parameterization rules, frontend CSP.
- A05 Security Misconfiguration / CWE-16: production HTTPS requirement, API docs disabled by default, security headers, strict CORS.
- A07 Identification and Authentication Failures / CWE-521: password strength requirements and login throttling routes.
- A09 Logging and Monitoring Failures / CWE-532: error redaction before logs and API responses.

Residual risk yang masih perlu roadmap:

- Replace browser `localStorage` bearer token storage with HttpOnly secure cookie or one-time token exchange.
- Add automated security regression tests for workspace path traversal, origin guard, and secret redaction.
- Run Semgrep, CodeQL, Gitleaks, and Trivy in CI before deployment.
- Keep `SCANNER_STORE_CODE_EVIDENCE=false` agar source snippet tidak disimpan di findings/report.
- Worker scan workspace harus memakai RAM-backed `tmpfs`, bukan persistent Docker volume.
- GitHub clone wajib memakai HTTPS dengan certificate verification aktif.
