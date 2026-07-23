# 12 — Local development and deployment

## Version policy

- The existing lockfile is the source of truth for JavaScript dependencies.
- Pin container images to explicit versions, not `latest`, once the repository establishes tested versions.
- Upgrade one subsystem at a time with tests.
- Do not hard-code documentation to a “latest” version; record tested versions in the repository's deployment files.

## Local prerequisites

- Git.
- Node.js version required by the repository.
- The package manager indicated by the lockfile.
- Docker-compatible runtime.
- Supabase CLI.
- Local services or reachable development instances for n8n, Tika, Ollama, and SMTP test sink.

## Suggested startup sequence

1. Copy `.env.example` to a local non-committed environment file.
2. Start Supabase locally.
3. Apply migrations/reset and seed.
4. Start Tika, Ollama, n8n, and a test SMTP sink through the repository's container setup.
5. Ensure required Ollama model is available.
6. Import/activate development n8n workflows.
7. Start the frontend.
8. Run smoke tests.

Codex must replace these generic steps with exact repository commands when implementation files exist.

## Environment separation

Use at least local, preview/staging, and production configurations. Never reuse production service-role or SMTP credentials in previews. Each environment has its own Supabase project/database/storage and n8n encryption key.

## Deployment components

- Static frontend hosting capable of Vite SPA fallback rules.
- Supabase project or approved self-hosted deployment.
- n8n Community instance; workers may be added later.
- Private Tika service.
- Private Ollama service with sufficient CPU/RAM/GPU for selected model.
- SMTP account/server.
- TLS and DNS for public surfaces.

## Network rules

- Public: frontend and explicitly selected Supabase/Edge endpoints.
- Restricted/admin: n8n editor.
- Internal only: Tika, Ollama, database direct connection, worker health ports.
- Webhooks between Supabase and n8n use shared secret or HMAC, timestamp, replay protection, and idempotent event ID.

## Environment variable catalog

See `docs/17-environment-variables.md`. Real values are never stored in Git.

## Release strategy

Deploy database migrations before frontend code that requires them, while preserving backward compatibility where a rolling deployment can observe mixed versions. High-risk public submission changes should be released to staging with E2E and tenant-isolation tests before production.
