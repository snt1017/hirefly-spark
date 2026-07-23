# 11 — Observability and operations

## Correlation

Generate or propagate a `request_id` through Edge Functions, database audit metadata, processing jobs, and n8n execution context. Do not expose internal execution IDs as user-facing support codes unless intentionally mapped.

## Activity events

Record business-significant actions:

- company created/updated,
- member invited/activated/suspended,
- job created/published/paused/closed/archived,
- application received,
- resume uploaded/parsed/needs review,
- evaluation completed/failed/reprocessed,
- stage changed,
- note added/updated,
- message drafted/approved/sent/failed.

Activity metadata is allow-listed per event and never includes complete resume text, full raw prompts, tokens, or secrets.

## Operational metrics

Suggested metrics:

- pending jobs by type and age,
- processing latency by job type,
- retry/failure rate,
- expired locks released,
- Tika/Ollama/SMTP latency and error rate,
- application submission failures,
- email send failures,
- database function error rate.

## Health checks

- Frontend deployment availability.
- Supabase connectivity through safe health operation.
- n8n worker health.
- Tika version/health endpoint on internal network.
- Ollama model availability.
- SMTP connectivity through controlled test, not frequent production email.

## Retry policy

Use bounded exponential backoff for transient network/service errors. Validation, authorization, unsupported file, duplicate, and schema-contract errors are not blindly retried. Retry behavior is specific to job type and error class.

## Backup and recovery

Before production:

- Define database backup schedule and restore test.
- Define Storage backup/retention approach.
- Export/version n8n workflows in Git.
- Keep prompts and JSON Schemas in Git.
- Document how to rebuild Tika/Ollama/n8n from pinned configuration.
- Test recovery of stuck jobs after n8n downtime.

## Incident priorities

1. Cross-tenant access or secret exposure: disable affected path, rotate credentials, preserve audit evidence.
2. Public upload abuse: rate-limit or disable submission, preserve safe diagnostics.
3. Duplicate email side effects: stop send workflow and reconcile idempotency records.
4. AI processing degradation: keep applications available for manual review; AI is non-blocking for recruiter access.
