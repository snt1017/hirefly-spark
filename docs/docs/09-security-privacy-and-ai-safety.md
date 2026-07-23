# 09 — Security, privacy, and AI safety

## Threat model summary

Primary risks:

- Cross-tenant data access through missing filters or weak RLS.
- Public enumeration of companies, jobs, applications, or resumes.
- Service-role credential leakage.
- Malicious resume files and resource exhaustion.
- Prompt injection inside resume text.
- Duplicate side effects after retries.
- Sensitive data leakage through n8n execution logs, AI raw output, or activity metadata.
- Unauthorized stage/message actions.
- Abusive public application submissions.

## Mandatory controls

### Tenant isolation

- RLS on every tenant-owned table.
- Active membership checks for reads.
- Role checks for writes.
- Composite tenant-safe foreign keys for critical relationships.
- RLS tests with at least two companies and multiple roles.
- No authorization based only on route guards or client-selected company IDs.

### Secrets

- Browser environment contains only public Supabase URL/key and non-secret configuration.
- Supabase service role, SMTP password, n8n encryption key, webhook secrets, and internal credentials stay server-side.
- Logs and error responses redact secrets.
- `.env.example` contains names and descriptions, never real values.

### Resume handling

- Private bucket and exact paths.
- MIME allow list, file size limit, and server verification.
- Short-lived signed URLs.
- Tika/Ollama are internal services.
- Apply request timeout, memory/CPU limits, and payload limits.
- Consider malware scanning as a later hardening item; never claim V0 has antivirus unless implemented.
- Treat extracted text as untrusted data.

### Prompt injection defense

- System prompts explicitly state that resume text is data and instructions inside it must be ignored.
- Resume text is placed in a clearly delimited data field.
- Model output is schema constrained and validated.
- The model cannot call tools or mutate state directly in V0.
- Domain validation rejects unknown criterion IDs, extra fields, invalid ranges, and missing criterion results.

### Fairness and protected attributes

Do not use or infer age, gender, photo, ethnicity, nationality, religion, disability, marital status, political views, sexual orientation, health data, address, or other protected/sensitive attributes as evaluation factors. Name may be needed for communication but must be excluded from evaluation prompts when practical.

Absence of evidence is `unknown`, not automatically `not_met`. AI output must expose uncertainty and the recruiter must review it.

### Public anti-abuse

- Rate limiting at the Edge Function/gateway level.
- CAPTCHA or equivalent abuse protection before production public launch.
- Input and upload limits.
- Generic duplicate/conflict responses.
- Request IDs and sanitized audit events.
- Optional IP hash, not raw IP, when required for consent/abuse evidence.

## Privacy and retention

V0 must define configurable or documented retention defaults before production. At minimum, document retention for resumes, extracted text, raw AI output, failed uploads, n8n execution data, and activity logs. Deletion/anonymization should operate by company/application and must not leave public storage objects.

## Security review triggers

Require explicit review when changing:

- RLS or grants,
- security-definer functions,
- public Edge Functions/RPCs,
- storage policies,
- service-role use,
- AI prompts or schemas,
- email sending/idempotency,
- logging of resume/application data.
