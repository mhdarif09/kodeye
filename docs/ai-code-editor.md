# Kodeye AI Code Editor Foundation

Kodeye is being shaped into an AI-first secure code editor: a workspace with file explorer, editor tabs, scanner diagnostics, AI review, patch preview, and CI/CD execution.

## MVP Status

Implemented foundation:

- Workspace metadata stored in the database.
- Workspace storage is scoped under `WORKSPACE_STORAGE_DIR`.
- Authenticated workspace APIs for create/list/read.
- File APIs for listing folders, reading content, writing, creating, deleting, and renaming files.
- Path traversal protection so requests cannot escape the workspace root.
- Generated and heavy folders are skipped in the file explorer.
- Editor file size guard defaults to 1 MB per file.
- Scanner stack includes code-quality checks, Semgrep CE, CodeQL, Gitleaks, and Trivy.

## Environment

```bash
WORKSPACE_STORAGE_DIR="./tmp/workspaces"
```

Production should point this at a persistent volume, for example:

```bash
WORKSPACE_STORAGE_DIR=/app/storage/workspaces
```

## Workspace API

- `POST /workspaces`
- `GET /workspaces`
- `GET /workspaces/:id`
- `GET /workspaces/:id/files?path=src`
- `GET /workspaces/:id/files/content?path=src/index.ts`
- `PUT /workspaces/:id/files/content`
- `POST /workspaces/:id/files`
- `DELETE /workspaces/:id/files?path=src/old.ts`
- `PATCH /workspaces/:id/files/rename`

All endpoints require the same bearer auth used by the existing dashboard APIs.

## Safety Rules

- Workspace paths are normalized and resolved before file operations.
- `..`, null bytes, and outside-root paths are rejected.
- Symlink entries are not returned by the explorer.
- Large or generated folders such as `node_modules`, `.git`, `dist`, `build`, `.next`, and `target` are hidden from explorer responses.
- The backend refuses to open or save files larger than the editor limit.

## AI Fix Contract

When Kodeye generates a fix for a scanner finding, the AI must ground the answer in the scanner finding, affected file, related context, framework, and existing style. The user-facing response follows this shape:

```json
{
  "explanation": "What the vulnerability is.",
  "rootCause": "Why this code is vulnerable.",
  "risk": "critical | high | medium | low",
  "patch": "unified diff",
  "tests": ["Tests or commands the user should run."],
  "sideEffects": ["Possible side effects or compatibility concerns."]
}
```

Internal fields such as `proposedContent`, `title`, `commitMessage`, and `approvalToken` are still returned so the UI can show a complete file preview and create a pull request only after explicit user approval.

## Next Steps

- Connect the frontend code-editor workspace to these APIs.
- Add Monaco editor tabs and diagnostics markers.
- Add AI chat using selected file content.
- Add patch/diff preview and approval before applying AI edits.
- Add CI/CD job runner endpoints with command safety checks.
