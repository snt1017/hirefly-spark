# Definition of done

A vertical slice is done only when all applicable items pass.

## Product

- [ ] Acceptance criteria are met.
- [ ] In-scope empty/loading/error/permission states exist.
- [ ] No production mock data remains connected.
- [ ] Accessibility behavior is verified.

## Data and security

- [ ] Schema constraints encode core invariants.
- [ ] Tenant-owned data has `company_id` and RLS.
- [ ] Role policy matches the permission matrix.
- [ ] Public response contains only allowed fields.
- [ ] Secrets and sensitive payloads are not logged or exposed.
- [ ] Storage access is private and tested when applicable.
- [ ] Idempotency exists for retryable side effects.

## Code

- [ ] Types and schemas are updated.
- [ ] Business logic is outside presentational components.
- [ ] Errors are mapped to stable user/contract behavior.
- [ ] No unjustified bypass (`any`, disabled lint, broad grant) remains.

## Tests and build

- [ ] Relevant unit/component tests pass.
- [ ] Integration/RLS tests pass.
- [ ] Critical E2E passes when applicable.
- [ ] Migration replay/reset succeeds.
- [ ] Format/lint/typecheck/build pass.

## Documentation

- [ ] `.env.example` is updated without secrets.
- [ ] Contract/data docs reflect the change.
- [ ] Operational/recovery steps are documented for asynchronous behavior.
- [ ] Completion report lists exact commands and known limitations.
