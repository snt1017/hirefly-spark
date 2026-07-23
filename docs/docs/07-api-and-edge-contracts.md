# 07 — API, RPC, and Edge contracts

Detailed payloads are in `contracts/public-api-contracts.md`.

## Contract principles

- Use explicit request/response shapes and stable error codes.
- Do not expose raw database errors to public callers.
- Include a `request_id` for correlation.
- Validate request bodies, URL parameters, file metadata, and environment variables.
- Return no private tenant information from public functions.
- All authenticated mutations verify membership and role in the database or trusted server code.
- Prefer transactional database functions for multi-row invariants.

## Public read functions

### `get_public_career_site`

Returns publishable company branding only when `careers_published = true`.

### `list_public_jobs`

Returns published jobs for a public company, applying allow-listed filters. Pagination is required before production if result size can grow.

### `get_public_job`

Returns one published, not archived job and its active public questions. Internal criteria are not public.

## Public application flow

Recommended two-step flow:

1. `begin-public-application`: validates public job and applicant data, checks duplicate policy, creates pending application records, and returns an exact upload authorization and application token.
2. Browser uploads directly to the private bucket path.
3. `finalize-public-application`: verifies object existence/metadata, records resume, activates application, creates jobs, and returns confirmation.

A single multipart Edge Function is acceptable if repository constraints make it safer and simpler, but the operation still needs transactional boundaries and orphan cleanup.

## Authenticated functions

- `create_company`
- `publish_job`
- lifecycle actions for pause/close/archive with role checks
- message approval
- retry processing job / request new profile or evaluation version
- signed resume URL generation after membership verification

## Error taxonomy

```text
VALIDATION_ERROR
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
CONFLICT
DUPLICATE_APPLICATION
JOB_NOT_OPEN
CAREERS_SITE_NOT_PUBLISHED
UPLOAD_NOT_FOUND
UNSUPPORTED_FILE_TYPE
FILE_TOO_LARGE
RATE_LIMITED
PROCESSING_NOT_RETRYABLE
INTERNAL_ERROR
```

Error response:

```json
{
  "error": {
    "code": "DUPLICATE_APPLICATION",
    "message": "An application already exists for this email and job.",
    "fieldErrors": {},
    "requestId": "uuid"
  }
}
```

Do not include stack traces, SQL text, internal IDs unrelated to the caller, or existence information that enables enumeration.
