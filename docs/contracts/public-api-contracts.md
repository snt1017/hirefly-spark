# Public and authenticated contract catalog

## Common success envelope

```json
{
  "data": {},
  "requestId": "uuid"
}
```

## Common error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid.",
    "fieldErrors": { "email": ["Enter a valid email."] },
    "requestId": "uuid"
  }
}
```

## `get_public_career_site(companySlug)`

Returns:

```json
{
  "publicSlug": "acme",
  "displayName": "Acme",
  "description": "...",
  "logoUrl": "...",
  "primaryColor": "#04474b",
  "secondaryColor": "#ffffff",
  "websiteUrl": "https://example.com",
  "contactEmail": "jobs@example.com",
  "seo": { "title": "Careers at Acme", "description": "..." }
}
```

Not found and unpublished sites return the same safe not-found behavior.

## `list_public_jobs`

Request: company slug plus allow-listed filters `department`, `location`, `workMode`, page/cursor.

Job summary returns slug, title, department, location, country, work mode, contract type, optional public salary, published/closes timestamps. It never returns internal IDs, criteria, creator IDs, or tenant metadata.

## `get_public_job`

Returns public job detail and active questions:

```json
{
  "job": { "slug": "senior-engineer", "title": "...", "description": "..." },
  "questions": [
    {
      "key": "public-safe-id",
      "question": "...",
      "answerType": "short_text",
      "required": true,
      "options": []
    }
  ]
}
```

Use opaque public question identifiers or signed context so callers cannot enumerate private table IDs unnecessarily.

## `begin-public-application`

Request:

```json
{
  "companySlug": "acme",
  "jobSlug": "senior-engineer",
  "applicant": {
    "name": "Alex Example",
    "email": "alex@example.com",
    "phone": null,
    "city": "Bogota",
    "countryCode": "CO",
    "linkedinUrl": null,
    "portfolioUrl": null
  },
  "answers": [{ "questionKey": "...", "value": "..." }],
  "consent": { "type": "privacy_processing", "policyVersion": "2026-07-21", "accepted": true },
  "resume": { "filename": "resume.pdf", "mimeType": "application/pdf", "sizeBytes": 12345 }
}
```

Response contains a short-lived application/upload token and exact upload path/authorization. Do not return internal candidate records.

## `finalize-public-application`

Request contains the application token and upload confirmation/checksum. Server verifies the exact object and metadata, then creates processing jobs and returns a public confirmation reference.

## `create_company`

Authenticated input: legal/internal/public names, slug, optional branding. Creates company, branding, owner membership, and activity atomically.

The authenticated onboarding flow invokes this RPC with the same validated company name for
`legal_name`, `internal_name`, and `display_name`, plus a normalized public slug. The function
derives the owner exclusively from `auth.uid()` and returns the new `company_id` and `public_slug`.
It must not accept a role, membership status, creator ID, or company ID from the browser.

When email confirmation is enabled, self-registration provisions the initial company through a
database trigger on `auth.users` in the same transaction. The trigger uses registration metadata
only for the company names and slug; it always derives the owner identity from `new.id`.

## `publish_job`

Authenticated input: job ID. Server resolves tenant from the job, checks recruiter role, validates aggregate, sets status/timestamp, and logs activity.

## `change_application_stage`

Authenticated input: application ID, target stage, optional reason. Server checks role, validates transition, updates application/history atomically, and logs activity.

## `approve_candidate_message`

Authenticated input: message ID. Server checks recruiter role, verifies draft content/recipient, sets approval fields, and optionally creates a send job.

## `get_resume_signed_url`

Authenticated input: resume ID. Server validates active membership and returns a very short-lived URL. No URL is cached in persistent browser storage.
