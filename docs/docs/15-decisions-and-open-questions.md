# 15 — Decisions and open questions

## Accepted architecture decisions

### ADR-001 — Supabase is canonical state

n8n never becomes the authoritative store for applications or evaluations.

### ADR-002 — Company-scoped candidates

Candidate uniqueness is within a company, not global. This avoids cross-customer identity linking.

### ADR-003 — Resume belongs to application

A resume is evidence submitted for a specific application. Candidate profiles are generated versions tied to that application/resume.

### ADR-004 — Branding separated from internal company record

This creates a clean public boundary and simplifies public-return contracts.

### ADR-005 — Publish through a function

Criterion count/weight and required job fields are aggregate invariants; a controlled transaction validates them.

### ADR-006 — Durable logical queue in PostgreSQL

`processing_jobs` provides auditable, portable asynchronous state compatible with n8n. Transport can evolve later without losing the domain record.

### ADR-007 — AI does not compute final weighted score

The model produces criterion-level support; deterministic code/SQL computes the total.

### ADR-008 — AI results are versioned

Reprocessing creates history rather than silently overwriting the prior result.

## Open questions to resolve before production

These do not block initial implementation when safe defaults are specified:

1. Maximum resume size and exact MIME allow list.
2. Selected Ollama model(s), tested context limits, hardware requirements, and timeout.
3. Retention periods for resumes, extracted text, raw model output, n8n executions, and audit logs.
4. CAPTCHA/rate-limit provider or self-hosted mechanism.
5. SMTP sender domain, bounce handling, and production deliverability setup.
6. Whether `unknown` criterion contributes zero to the support score or uses a separate “coverage-adjusted” presentation. Current recommended V0 behavior: zero plus a prominent insufficient-evidence signal.
7. Whether applicants may replace a resume before review; V0 assumes one current resume.
8. Which authentication methods are enabled and whether email verification is mandatory.
9. Production hosting topology and backup ownership.
10. Legal privacy text and consent policy version.

Record resolved decisions as ADRs in the implementation repository and update this pack or its successor.
