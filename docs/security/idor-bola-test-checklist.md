# IDOR/BOLA Test Checklist

- Create two organizations owned by different users and add a member to only one.
- Replace organization, repository, scan, finding, report, payment, and invoice IDs with IDs from the other organization.
- Verify read requests return `404`/`403` without leaking object details.
- Verify members cannot mutate repository automation, GitHub installation/sync, plans, payments, or subscriptions.
- Verify non-admin users cannot access any `/api/admin/*` or settings endpoint.
- Verify report HTML/PDF/JSON and invoice downloads enforce the same tenant rules as their JSON detail endpoints.
- Repeat tests with guessed IDs, stale JWTs, missing JWTs, and admin JWTs.
