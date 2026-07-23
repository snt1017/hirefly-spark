# AGENTS.md — Binding instructions for Codex

## Mission

Implement the smallest complete vertical slice of Hirefly MVP V0 while preserving tenant isolation, data integrity, human oversight, and portability.

## Read before coding

At minimum, read:

1. `PROJECT_MANIFEST.yaml`
2. `docs/00-project-overview.md`
3. `docs/02-system-architecture.md`
4. The domain-specific document for the requested task
5. `database/data-dictionary.md` for any persistence change
6. `docs/09-security-privacy-and-ai-safety.md` for any auth, public, resume, AI, or email change
7. `checklists/definition-of-done.md`

## Repository inspection protocol

Before editing:

- Identify the package manager from the existing lockfile. Never add a second package manager.
- Inspect `package.json`, TypeScript config, Vite config, router, component system, tests, linting, Supabase directory, environment examples, CI, and existing conventions.
- Search for mock repositories, hard-coded data, duplicated types, and direct Supabase calls from UI components.
- State assumptions briefly in the task summary, then implement without waiting for confirmation unless a safety-critical fact is impossible to infer.

## Fixed architecture rules

- PostgreSQL in Supabase is the source of truth.
- Auth identity comes from `auth.users`; application user fields live in `profiles`.
- Roles and tenant membership live in `company_members`, not editable user metadata.
- Every tenant-owned table includes `company_id` and RLS.
- Critical cross-table references use composite tenant-safe foreign keys where practical.
- Public users do not receive broad table access. Public reads use controlled RPC/view contracts; public application submission uses an Edge Function or equivalent controlled server operation.
- The `resumes` bucket is private. Resume access uses short-lived signed URLs.
- Service-role credentials never enter browser code, build output, logs, screenshots, or client environment variables.
- n8n reads and writes canonical state in Supabase and claims jobs atomically.
- AI output is validated against JSON Schema before persistence.
- Weighted candidate scores are calculated deterministically outside the language model.
- AI evaluations are versioned and append-only from a business-history perspective.
- No automated rejection, hiring decision, or stage transition based solely on an AI score.

## Frontend rules

- Keep route components thin; business access belongs in typed services/hooks.
- Do not call Supabase directly from presentational components.
- Use Zod at external boundaries: forms, RPC/Edge responses, AI outputs, and environment variables.
- Use TanStack Query for server state and explicit query keys scoped by company and entity.
- Use React Hook Form for nontrivial forms.
- Provide loading, empty, success, validation, unauthorized, forbidden, and recoverable error states.
- The private dashboard uses a neutral design system. Company colors apply only to the public careers surface and preview.
- Primary Hirefly brand color: `#04474b`.
- Accessibility is part of completion: labels, keyboard support, focus visibility, semantic headings, and adequate contrast.

## Database rules

- Migrations are immutable after merge; create a new migration for changes.
- Use UUID primary keys, `timestamptz`, explicit constraints, and useful indexes.
- Use `citext` for case-insensitive public slugs/emails where specified.
- Do not enforce criterion-weight sum during draft editing; validate atomically in `publish_job()`.
- Public and privileged functions use a fixed `search_path`, explicit grants, and least privilege.
- Never use `security definer` casually. Document why it is required and test privilege boundaries.
- Add or update RLS tests for every tenant-owned table or policy change.

## Asynchronous workflow rules

- `processing_jobs` is the durable job record.
- Claim jobs with a transactional function using `FOR UPDATE SKIP LOCKED`.
- Every externally visible side effect has an idempotency key.
- Retries must not duplicate evaluations, messages, notes, or activity records.
- Store concise errors; never store secrets or full resume text in execution logs.
- A failed job must end in a diagnosable state and remain recoverable.

## Change protocol

For every implementation task:

1. Inspect existing behavior and tests.
2. Define the vertical slice and acceptance criteria.
3. Update types/contracts first when needed.
4. Implement database migration and authorization before UI access.
5. Implement service layer and validation.
6. Implement UI and states.
7. Add unit, integration, RLS, and/or E2E tests appropriate to the risk.
8. Run formatting, lint, type checking, tests, and build using repository scripts.
9. Update relevant documentation and `.env.example` without real secrets.
10. Report changed files, commands run, results, assumptions, and remaining risks.

## Prohibited shortcuts

- No frontend-only authorization.
- No public resume bucket.
- No service-role key in client code.
- No `any` to bypass contract errors unless narrowly justified and removed before completion.
- No unvalidated model JSON.
- No weighted score calculated by the model.
- No hidden automatic rejection.
- No cross-tenant query without both RLS protection and tenant-aware keys/filtering.
- No second source of truth in n8n.
- No paid SaaS dependency without an explicit product decision.
- No leaving mock data connected to a feature marked complete.

## Completion output

The final task report must include:

- Summary of the completed slice.
- Files changed.
- Database migrations and policy changes.
- Security implications.
- Tests and exact commands executed.
- Known limitations or follow-up work.
