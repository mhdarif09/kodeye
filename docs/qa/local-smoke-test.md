# Local Smoke Test

Start the API and frontend locally, then run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-smoke-test.ps1
```

or:

```bash
./scripts/local-smoke-test.sh
```

The script checks API health, public plans, frontend availability, invalid login
handling, and common security headers. It does not mutate billing, trigger
scanners, or test real provider credentials. Complete the final QA and
IDOR/BOLA checklists manually for those flows.
