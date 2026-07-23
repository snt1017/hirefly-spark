# 05 — Database, RLS, and Storage

## Schemas

Recommended schemas:

- `public`: application tables and intentionally exposed RPC entry points.
- `private`: authorization helpers and internal functions not exposed through the Data API.
- `auth`: managed by Supabase Auth.
- `storage`: managed by Supabase Storage.

## RLS authorization model

Membership is the authorization source. A user may read a tenant row when an active `company_members` row exists for `auth.uid()` and the row's `company_id`. Mutations require role-specific helpers.

Recommended helper functions:

```sql
private.is_active_company_member(target_company_id uuid)
private.has_company_role(target_company_id uuid, allowed_roles member_role[])
private.can_manage_company(target_company_id uuid)
private.can_recruit(target_company_id uuid)
```

Helpers used in policies should be stable, have a fixed `search_path`, and avoid recursive policy evaluation. Grant execute only to required roles.

## Role matrix

| Capability | Owner | Admin | Recruiter | Viewer |
|---|---:|---:|---:|---:|
| Read company and branding | Yes | Yes | Yes | Yes |
| Edit branding | Yes | Yes | No | No |
| Manage members | Yes | Yes | No | No |
| Create/edit jobs | Yes | Yes | Yes | No |
| Publish/pause/close jobs | Yes | Yes | Yes | No |
| Read candidates/evaluations | Yes | Yes | Yes | Yes |
| Move pipeline/add notes | Yes | Yes | Yes | No |
| Approve messages | Yes | Yes | Yes | No |
| Archive company | Yes | No | No | No |

## Public access

The anonymous role must not directly select tenant-private tables. Public reads use narrow functions or views that return only publishable fields. Public application writes use an Edge Function because the flow includes anti-abuse controls, validation, candidate upsert, application creation, upload authorization/finalization, consent, and job creation.

## Storage

### `company-assets`

- Public read for approved assets.
- Owner/admin write.
- Path: `{company_id}/branding/{uuid}.{extension}`.
- Restrict MIME type and size.

### `resumes`

- Private bucket.
- No anonymous listing or reading.
- Exact path: `{company_id}/{job_id}/{application_id}/{uuid}.{extension}`.
- Candidate upload uses a short-lived exact-path authorization.
- Recruiter and n8n reads use short-lived signed URLs after authorization.
- Storage policies verify path company ID against active membership for authenticated human reads.

## Required database functions

- `create_company(...)`: atomic company, branding, owner membership, and audit creation.
- `publish_job(job_id)`: authorization and aggregate validation before publishing.
- `get_public_career_site(company_slug)`.
- `list_public_jobs(company_slug, filters)`.
- `get_public_job(company_slug, job_slug)`.
- `claim_processing_jobs(worker_id, limit, lock_seconds, job_types)` using `FOR UPDATE SKIP LOCKED`.
- `release_expired_processing_locks(limit)`.
- Optional `calculate_evaluation_total(evaluation_id)` for deterministic calculation/verification.

## Migration requirements

- Explicitly enable RLS on every exposed table.
- Revoke default privileges that exceed requirements.
- Add indexes after constraints and before production traffic.
- Migration replay from an empty local database must succeed.
- Seed data must use deterministic test identities or documented local setup helpers.
- Never edit a migration already merged to a shared branch.

## Sensitive fields

Full resume text, raw AI output, messages, notes, and evaluation evidence are private. Public functions use explicit return types rather than `select *`. Activity metadata must not copy these sensitive fields.
