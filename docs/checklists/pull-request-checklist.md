# Pull request checklist

- [ ] The PR implements one coherent vertical slice or clearly explains why it cannot.
- [ ] The description identifies user outcome and non-goals.
- [ ] Database migrations are forward-only and replay successfully.
- [ ] RLS/grants/security-definer changes have focused tests and explanation.
- [ ] No service-role or secret is exposed.
- [ ] Public payloads are validated and minimized.
- [ ] AI schemas/prompts are versioned when changed.
- [ ] Score calculation remains deterministic.
- [ ] Retryable side effects are idempotent.
- [ ] Mock code removed from completed production paths.
- [ ] Loading/error/empty/forbidden states are covered.
- [ ] Accessibility impact considered.
- [ ] Exact format/lint/typecheck/test/build commands pass.
- [ ] Documentation and environment examples are updated.
