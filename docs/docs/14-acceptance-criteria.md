# 14 — Acceptance criteria

## AC-01 Company onboarding

**Given** an authenticated user with no company, **when** they submit valid onboarding data, **then** one company, one branding row, one active owner membership, and one activity event are created in one transaction.

## AC-02 Tenant isolation

**Given** users from Company A and Company B, **when** either user requests the other company's jobs, applications, resumes, evaluations, notes, messages, or activity by known UUID, **then** the database returns no unauthorized data and the UI shows forbidden/not found safely.

## AC-03 Job publication

**Given** a draft job, **when** a recruiter publishes it, **then** the operation succeeds only with required fields, 4–8 active criteria, and exactly 100 total active weight. Publication timestamp is set transactionally.

## AC-04 Public careers visibility

Only a company with `careers_published = true` and jobs with `status = published` are available through public contracts. Internal criteria and tenant-private fields are not returned.

## AC-05 Public application

A valid application creates a company-scoped candidate, immutable application contact snapshots, answers, consent, resume metadata, initial stage/history, and processing job. An invalid or incomplete upload does not expose an orphaned resume.

## AC-06 Duplicate application

A second submission using the same normalized email, company, and job returns a safe `DUPLICATE_APPLICATION` conflict and creates no duplicate candidate/application/job.

## AC-07 Resume privacy

Anonymous users cannot list or read resume objects. Authorized members receive only short-lived signed access. A member of another company cannot obtain a URL.

## AC-08 Resume parsing

A supported text-bearing resume produces a schema-valid versioned candidate profile. A document without extractable text is marked `needs_review` with a user-visible explanation and retry/manual access path.

## AC-09 AI evaluation

An evaluation stores model, prompt version, criteria version, deterministic total, recommendation, evidence, confidence, warnings, and criterion snapshots. Invalid model output persists no partial evaluation.

## AC-10 Human oversight

No evaluation result automatically rejects, hires, or changes a candidate's stage. All employment-related transitions require an authenticated authorized human action.

## AC-11 Idempotent processing

Re-running a completed processing job or send operation with the same idempotency key does not duplicate candidate profiles, evaluations, criterion scores, messages, or emails.

## AC-12 Pipeline history

Every stage change stores from/to stage, actor, optional reason, and timestamp; current `applications.stage` agrees with the latest history event.

## AC-13 Message approval

A draft cannot be sent. Only an approved message can be queued. The send workflow rechecks approval immediately before SMTP and stores success/failure state.

## AC-14 Viewer permissions

A viewer can read allowed tenant data but cannot create/edit/publish jobs, move stages, add notes, approve messages, or manage branding/members.

## AC-15 Quality gates

Formatting, lint, type checking, relevant tests, migration replay, RLS tests, and production build pass using repository commands. Documentation and `.env.example` reflect the delivered change.
