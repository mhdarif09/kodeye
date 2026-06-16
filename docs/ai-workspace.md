# Kodeye AI Workspace

The first Mini Antigravity slice adds Groq-powered AI review to every saved
security finding.

## Current Flow

1. Connect and synchronize a GitHub repository.
2. Kodeye automatically scans the repository.
3. Open a completed scan and select **Ask AI** on a finding.
4. Kodeye sends sanitized finding metadata and the user's question to Groq.
5. Groq returns a structured explanation, risk assessment, remediation steps,
   verification steps, and an optional generic fix example.

AI review does not read repository source code. When an organization owner
explicitly selects **Generate Fix**, Kodeye retrieves the single target file
from GitHub and sends it to Groq for a one-time fix proposal. The proposal is
held only in the browser until the user approves or closes the workspace.

After the user reviews the complete current and proposed file and selects
**Approve & Create Pull Request**, Kodeye:

1. Verifies that the source file SHA has not changed.
2. Creates a new `kodeye/ai-*` branch.
3. Commits only the approved target file.
4. Opens a pull request.
5. Relies on the configured pull-request webhook automation to rescan it.

Kodeye never pushes an AI fix directly to the default branch and does not
auto-merge the pull request.

## Configuration

```env
AI_ENABLED=true
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
AI_MAX_COMPLETION_TOKENS=1200
AI_REQUEST_TIMEOUT_MS=30000
AI_FIX_MAX_COMPLETION_TOKENS=16000
AI_FIX_MAX_FILE_BYTES=30000
AI_GITHUB_WRITE_ENABLED=false
```

The model is configurable because provider model availability can change.

## Privacy and Security

- Kodeye does not persist AI questions or responses in this phase.
- Kodeye does not send finding evidence or source snippets to Groq.
- Generate Fix sends the complete single target file only after explicit user
  action. Kodeye does not persist the returned proposal.
- Requests contain finding title, category, severity, CWE, OWASP, location,
  scanner description, impact, recommendation, and the user's question.
- Users should not paste source code, credentials, secrets, or personal data
  into AI questions.
- AI review is advisory. Scanner findings and manual validation remain the
  security decision inputs.
- The AI endpoint is authenticated, tenant-scoped, DTO-validated, rate-limited,
  and time-bounded.
- Generate Fix and Create Pull Request are owner-only operations.
- Approval tokens are short-lived and cryptographically bind the exact file
  content, commit message, PR title, finding, and source SHA shown to the user.
- Sensitive paths, `.env` files, secrets, private keys, credentials, and GitHub
  workflow files are blocked from AI write automation.
- `AI_GITHUB_WRITE_ENABLED=false` is the default deployment posture.

## Next Safe Expansion

The next slice should create an ephemeral read-only workspace that supports
allowlisted `search_code` and `read_file` operations, followed by isolated
pre-commit verification before pull-request creation.
