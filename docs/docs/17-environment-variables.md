# 17 — Environment variable catalog

Names may be adapted to existing repository conventions. Never expose server-only variables through Vite's public prefix.

## Browser-safe

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon/publishable key |
| `VITE_APP_URL` | Canonical frontend URL |
| `VITE_ENVIRONMENT` | local/staging/production label |

## Supabase Edge Functions / trusted server

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Internal/project URL |
| `SUPABASE_ANON_KEY` | Caller-context operations when needed |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-only operations |
| `PUBLIC_APPLICATION_HMAC_SECRET` | Optional signed application flow token |
| `N8N_WEBHOOK_URL` | Internal workflow activation URL |
| `N8N_WEBHOOK_SECRET` | HMAC/shared secret |
| `APPLICATION_RATE_LIMIT_*` | Chosen rate-limit configuration |
| `CAPTCHA_SECRET` | Production anti-abuse verification |
| `RESUME_MAX_BYTES` | Server-enforced upload limit |
| `RESUME_ALLOWED_MIME_TYPES` | Server allow list |

## n8n

| Variable | Purpose |
|---|---|
| `N8N_ENCRYPTION_KEY` | Encrypt stored credentials |
| `N8N_HOST`, `N8N_PROTOCOL`, `WEBHOOK_URL` | Base URLs |
| `DB_*` | n8n operational database if configured |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Secure service credential |
| `TIKA_URL` | Internal Tika endpoint |
| `OLLAMA_URL` | Internal Ollama endpoint |
| `OLLAMA_MODEL_RESUME` | Resume parser model |
| `OLLAMA_MODEL_EVALUATION` | Evaluation model |
| `OLLAMA_MODEL_FOLLOW_UP` | Draft model |
| `SMTP_HOST`, `SMTP_PORT` | Mail server |
| `SMTP_USER`, `SMTP_PASSWORD` | Mail credentials |
| `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL` | Sender identity |
| `PROCESSING_WORKER_ID` | Stable worker identifier |
| `PROCESSING_LOCK_SECONDS` | Job lock duration |
| `PROCESSING_BATCH_SIZE` | Claim batch size |

## Operational

| Variable | Purpose |
|---|---|
| `LOG_LEVEL` | Logging verbosity without sensitive payloads |
| `SENTRY_DSN` or chosen equivalent | Optional error monitoring; not required by V0 |
| `RETENTION_*` | Retention configuration when implemented |

`.env.example` should state which component consumes each variable and whether it is secret.
