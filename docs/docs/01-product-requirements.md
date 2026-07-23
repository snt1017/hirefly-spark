# 01 — Product requirements

## Functional requirements

### Authentication and onboarding

- Users can sign up, sign in, sign out, and recover access using Supabase Auth-supported flows selected by the repository.
- A successful signup creates a `profiles` row through a database trigger.
- The first authenticated onboarding flow creates a company, branding row, owner membership, and activity record atomically.
- A user can belong to multiple companies; active company selection must be explicit in the UI and query keys.

### Company branding

- Editable fields: display name, description, logo, primary color, secondary color, website, public contact email, public slug, SEO title, and SEO description.
- The company can publish or unpublish its careers site.
- Company colors affect only the public careers pages and preview, not the private dashboard shell.
- The primary Hirefly product color is `#04474b`.

### Job management

- Create, edit, duplicate, save draft, publish, pause, close, and archive.
- Fields: title, department, location, country, work mode, contract type, description, responsibilities, requirements, minimum experience, optional salary range, optional closing date.
- A job slug is unique within its company.
- Publishing is a transaction, not a plain status update.
- Publishing validates required content, active criterion count (4–8), and total weight (100).

### Evaluation criteria

Each criterion includes name, description, type, required/desirable flag, weight, expected evidence, fulfillment condition, active flag, and order. Draft criteria may temporarily sum to values other than 100; only publication requires exactly 100.

### Public careers site

- Public company header and branding.
- List only published, non-expired jobs for a published careers site.
- Filter by department, location, and work mode.
- Job detail shows public fields and application questions.
- Do not expose internal IDs, criteria weights, recruiter notes, AI data, or private contact data.

### Public application

- Fields: name, email, optional phone, city/country, optional LinkedIn, optional portfolio, resume, job-specific answers, and required consent.
- Duplicate policy: one active application per normalized email, company, and job. The API returns a safe conflict message without exposing other application details.
- Resume uploads allow configured MIME types and size limits only.
- A successful submission creates or reuses the company-scoped candidate, creates the application snapshot, answers, consent, resume metadata, initial stage history, processing job, and confirmation job/message state.
- The operation must be resilient to partial upload failure; no orphaned accessible resume is allowed.

### Candidate review

- Candidate list by job with search, stage filter, processing status filter, and sorting by date or score.
- Candidate detail includes application snapshot, answers, resume access, structured profile, current evaluation, criterion-level evidence, warnings, notes, messages, and history.
- AI score is labeled as decision support and displays confidence/missing information.
- A recruiter can request reprocessing without overwriting prior versions.

### Pipeline

Fixed V0 stages:

`new → pending_review → shortlisted → contacted → interview → assessment → offer → hired`

`not_proceeding` can be reached from any active stage through a human action. The UI may permit backward movement where operationally useful. Every transition records actor, old stage, new stage, reason, and timestamp.

### Notes and messages

- Recruiters and above can add private notes.
- Follow-up generation creates a draft only.
- An authorized human approves a draft before sending.
- Sending is asynchronous and idempotent.
- Message status: `draft`, `approved`, `queued`, `sent`, `failed`, `cancelled`.

### Basic analytics

- Open jobs, applications by recent period, candidates by stage, processing failures, and average review-support score.
- Analytics are company-scoped and must not become a reason to weaken RLS.

## Non-functional requirements

- Responsive and keyboard usable.
- Strict TypeScript where repository configuration permits.
- No secrets in browser bundles.
- Database authorization survives direct API requests and modified clients.
- Every external boundary is validated.
- Retryable asynchronous processing with traceable failure states.
- Logs exclude full resumes, credentials, tokens, and unnecessary personal data.
- The project can run locally from repository instructions.
- Dependencies are minimized and pinned through the lockfile or container image tags.
