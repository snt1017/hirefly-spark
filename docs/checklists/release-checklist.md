# Release checklist

## Before staging

- [ ] All migrations apply from empty local state.
- [ ] RLS tenant matrix passes.
- [ ] Public application abuse controls configured for environment.
- [ ] Resume MIME/size limits configured.
- [ ] Ollama model and prompt/schema compatibility tested.
- [ ] Tika resource limits configured.
- [ ] SMTP uses test sink in staging.
- [ ] n8n workflows exported and versioned.

## Before production

- [ ] Production secrets are set and not copied from staging.
- [ ] DNS/TLS and SPA route fallback are correct.
- [ ] Backups and restore process are documented/tested.
- [ ] Internal services are not publicly exposed.
- [ ] Retention/privacy/consent versions are approved.
- [ ] Critical E2E flow passes in production-like staging.
- [ ] Rollback/forward-fix owner is identified.

## After release

- [ ] Check public careers and application smoke flow.
- [ ] Verify processing queue age and failures.
- [ ] Verify no cross-tenant or authorization errors.
- [ ] Verify email delivery state without sending duplicate messages.
- [ ] Record release version and migrations.
