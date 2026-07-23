# 10 — Testing and quality strategy

## Test pyramid

### Unit tests

- Zod schemas and DTO mappers.
- Score calculation and rounding.
- Stage transition rules.
- Criterion weight summaries.
- Error mapping and redaction.
- Prompt payload minimization.
- Idempotency key generation.

### Component tests

- Forms and validation messages.
- Permission-aware actions.
- Evaluation states (`met`, `partially_met`, `not_met`, `unknown`).
- Loading/empty/error UI.
- Branding contrast fallback.

### Service integration tests

- Typed Supabase/RPC/Edge adapters with local Supabase or stable mocks at the transport boundary.
- Duplicate application behavior.
- Signed resume URL authorization.
- Message approval transitions.

### Database and RLS tests

Use local Supabase and SQL/pgTAP-style tests as supported by the repository. Cover every policy and role matrix. See `database/rls-test-matrix.md`.

### E2E tests

Minimum high-value flows:

1. Owner signup → company onboarding → branding.
2. Recruiter creates valid job → publishes → public page displays it.
3. Candidate applies → upload finalizes → confirmation appears.
4. Recruiter sees only own-company application.
5. Processing result appears on candidate detail.
6. Recruiter changes stage and adds note.
7. Recruiter generates, approves, and queues a message using a test SMTP sink.
8. Viewer cannot mutate.
9. Cross-tenant URL/API attempts fail.

## Quality commands

Codex must use scripts already defined by the repository. Expected categories:

```text
format/check
lint
typecheck
test
test:db or equivalent
test:e2e
build
```

Do not invent script names in reports; list the exact commands actually run.

## Contract tests for AI

- Valid parser output passes schema.
- Additional fields fail when schema is strict.
- Protected/sensitive inferred fields are absent.
- Invalid dates/ranges fail or normalize through documented logic.
- Evaluator returns exactly the active criterion IDs.
- Scores outside 0–100 and confidence outside 0–1 fail.
- Malicious resume instructions do not change output shape or workflow behavior.
- Invalid JSON produces a retryable/failed processing result, not partial persistence.

## Migration verification

- Apply all migrations from empty local state.
- Reset and seed successfully.
- Generated types match schema.
- Roll-forward correction migration tested for changes to existing data.
- Indexes support documented query shapes.

## Definition of done

Use `checklists/definition-of-done.md`. A passing UI happy path alone is insufficient for tenant-owned or public functionality.
