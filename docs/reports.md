# Kodeye Reports

## Available formats

- **Dashboard report** presents report data in a responsive UI.
- **HTML** is a standalone, printable report with embedded CSS and no required
  external assets.
- **PDF** is rendered from the sanitized HTML report using `puppeteer-core`.
- **JSON** provides structured report data for integrations without finding
  `rawJson`.

All report endpoints are protected and limited to users who can access the
scan's organization.

## Report data

Reports contain scan, repository, and organization metadata; executive summary;
severity distribution; scanner coverage inferred from scan logs; sanitized
findings; recommended priorities; and a short scan-log summary.

Secret evidence remains masked. Full scanner output, GitHub tokens, private
keys, and finding `rawJson` are excluded.

## Risk level calculation

Risk level uses the highest finding severity:

1. Any critical finding: `CRITICAL`
2. Otherwise any high finding: `HIGH`
3. Otherwise any medium finding: `MEDIUM`
4. Otherwise any low finding: `LOW`
5. Otherwise informational findings: `INFO`
6. A failed scan: `UNKNOWN`

Risk level is a prioritization aid, not a guarantee of security.

## Scanner coverage

- Semgrep: SAST and source-code pattern analysis
- Gitleaks: secret-leak detection
- Trivy: dependency vulnerability and misconfiguration analysis

A scanner appears only when findings or scan logs show scanner activity.
Failed scanners are marked failed rather than presented as completed.

## PDF setup and troubleshooting

PDF export uses `puppeteer-core` so CI and normal installs do not download a
large browser automatically. The API auto-detects common Chrome/Chromium paths.
For custom installations, set:

```env
REPORT_ENABLE_PDF=true
PUPPETEER_EXECUTABLE_PATH="/path/to/chromium"
```

On Windows, the path may resemble:

```env
PUPPETEER_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

If Chromium is missing or cannot start, the API returns:

```text
PDF generation failed. Please ensure browser dependencies are installed.
```

The API does not crash, and HTML/JSON reports remain available.

## Limitations and disclaimer

Reports summarize automated scanner results. They do not prove that a codebase
is secure or vulnerability-free. Manual security review, secure code review,
and penetration testing remain recommended.
