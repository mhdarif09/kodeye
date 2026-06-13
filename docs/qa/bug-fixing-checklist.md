# Bug Fixing Checklist

- Reproduce with the smallest safe fixture and record expected versus actual behavior.
- Check tenant authorization and secret exposure before changing logic.
- Add or update validation at the boundary closest to the untrusted input.
- Preserve payment/webhook idempotency and transaction boundaries.
- Verify the fix with success, failure, duplicate, and unauthorized cases.
- Run lint/build and update the relevant security or setup documentation.
