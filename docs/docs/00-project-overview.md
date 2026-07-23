# 00 — Project overview

## Product statement

Hirefly is a B2B recruiting platform for small and medium-sized teams that need a branded careers experience and structured candidate review without mandatory paid AI APIs. It centralizes jobs, applications, resumes, pipeline activity, and communications. Local AI extracts evidence and compares it with recruiter-defined criteria; a human recruiter remains accountable for every decision.

## Users

### Company owner

Creates the company, controls branding and members, and can perform all recruiting actions.

### Company admin

Manages branding, members, jobs, candidates, and messages, but cannot archive the company unless explicitly granted later.

### Recruiter

Creates and manages jobs, reviews candidates, changes pipeline stages, writes notes, and approves communications.

### Viewer

Has read-only access to company information, jobs, candidates, evaluations, and history.

### Candidate

Uses the public careers surface without an account to browse published roles and submit an application.

## V0 outcome

A company must be able to:

1. Register and create a company.
2. Configure its public identity.
3. Create a job with 4–8 weighted criteria whose active weights total 100.
4. Publish the job on a branded careers page.
5. Receive a candidate application and a private resume.
6. Extract resume text and produce a structured candidate profile.
7. Evaluate the profile against job criteria with evidence and uncertainty.
8. Review the result, move the candidate through the pipeline, and add notes.
9. Generate a follow-up draft, approve it, send it through SMTP, and inspect the audit trail.

## Product principles

- **Human-in-the-loop:** AI supports review; it does not decide employment outcomes.
- **Evidence over assertion:** Every criterion result references evidence or explicitly reports missing information.
- **Tenant isolation by construction:** Data boundaries exist in keys, functions, RLS, storage paths, and tests.
- **Portable runtime:** Build-time assistants are not runtime dependencies.
- **Deterministic side effects:** Scoring, job claiming, retries, and email sends are idempotent and auditable.
- **Privacy-aware defaults:** Resumes are private, logs are minimized, and public endpoints expose only required fields.

## Success metrics for V0 validation

These are product validation metrics rather than contractual SLAs:

- A recruiter can publish a valid job without database access.
- A candidate can complete the public application flow on mobile and desktop.
- A recruiter cannot access another company's candidate data, even by changing an ID in the URL or request.
- A duplicate application to the same company and job is handled predictably.
- A resume-processing failure is visible and retryable without duplicate records.
- AI output with invalid JSON is rejected and captured as a recoverable processing error.
- Re-running an evaluation with the same idempotency key does not create duplicate output.
- Every stage change and sent message appears in history.

## Explicitly outside V0

Billing, SSO, job-board integrations, LinkedIn imports, WhatsApp, calendar scheduling, video calls, candidate accounts, configurable stages, global talent pools, cross-job matching, autonomous interviews, advanced analytics, and offer signatures are not part of V0.
