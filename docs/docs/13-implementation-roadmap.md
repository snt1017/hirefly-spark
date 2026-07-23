# 13 — Implementation roadmap

Each iteration is a set of complete vertical slices. Do not implement every table first and leave unusable UI indefinitely; migrations should support the next working product capability.

## Iteration 0 — Repository assessment

- Inventory routes, components, mocks, package manager, tests, environment handling, and CI.
- Document current gaps against this pack.
- Establish formatting, lint, type checking, test, and build commands.
- Add `AGENTS.md` and link project docs in the repository.

## Iteration 1 — Foundations

- Supabase local setup and migrations for profiles, companies, branding, memberships.
- Auth profile trigger.
- `create_company()` transaction.
- RLS helpers and tenant tests.
- Private app shell and onboarding.
- Company selector and branding editor.

Exit: an owner can authenticate, create a company, and edit its branding; another tenant cannot read it.

## Iteration 2 — Jobs and public careers

- Jobs, criteria, questions, indexes, and RLS.
- Job editor and draft state.
- `publish_job()` validation.
- Public company/job read contracts.
- Careers page, filters, job detail.

Exit: a recruiter publishes a valid job and sees it publicly; invalid weights cannot publish.

## Iteration 3 — Applications and private storage

- Candidates, applications, answers, consents, stage history, resumes.
- Controlled public application flow.
- Private buckets and policies.
- Duplicate prevention.
- Candidate list/detail foundation.

Exit: a candidate applies with a private resume and recruiter sees the application only in the correct tenant.

## Iteration 4 — Resume processing

- Candidate profile versions and processing jobs.
- Atomic claim/release functions.
- n8n resume workflow.
- Tika and Ollama adapters.
- Parser schema and prompt.
- Processing states/retry UI.

Exit: a valid resume creates a structured profile; invalid/no-text documents are diagnosable and reviewable.

## Iteration 5 — Evaluation

- AI evaluation and criterion score tables.
- Evaluator workflow and schema.
- Deterministic score calculation.
- Evaluation UI with evidence/uncertainty.
- Reprocessing/version history.

Exit: recruiter receives explainable, versioned decision support without automatic stage movement.

## Iteration 6 — Recruiting operations

- Pipeline transition function/history.
- Notes.
- Follow-up generation.
- Approval and send-email workflow.
- Activity timeline.
- Basic analytics.

Exit: recruiter can operate the candidate lifecycle and send an approved, auditable message.

## Iteration 7 — Production hardening

- Complete RLS matrix and adversarial tests.
- Public anti-abuse controls.
- Observability, recovery, and retention jobs.
- Backup/restore test.
- E2E critical journeys.
- Accessibility and performance review.

Exit: V0 success flow is reproducible in staging and production runbooks exist.
