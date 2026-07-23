# Migration plan

Recommended ordered files:

```text
001_extensions_and_types.sql
002_profiles_and_auth_trigger.sql
003_companies_branding_memberships.sql
004_company_invitations.sql
005_jobs_criteria_questions.sql
006_candidates_applications.sql
007_answers_consents_stage_history.sql
008_storage_buckets_and_resume_metadata.sql
009_candidate_profiles.sql
010_ai_evaluations.sql
011_notes_messages_activity.sql
012_processing_jobs.sql
013_private_rls_helpers.sql
014_table_rls_policies.sql
015_storage_policies.sql
016_company_and_job_rpc.sql
017_public_read_functions.sql
018_processing_rpc.sql
019_indexes.sql
020_seed_data.sql
021_rls_and_tenant_isolation_tests.sql
```

## Implementation notes

- Enable `pgcrypto`/UUID support as required by the selected Supabase/Postgres version and `citext`.
- Create enums before tables that reference them.
- Create unique `(company_id, id)` constraints before composite foreign keys.
- Use a generic `set_updated_at()` trigger for mutable tables.
- Auth profile trigger must tolerate metadata absence and never copy credentials.
- Storage bucket creation should be idempotent in seed/setup logic.
- Public functions use explicit grants and return types.
- `claim_processing_jobs` is private/trusted and must not be executable by ordinary authenticated users.
- Add comments on sensitive tables/columns where helpful.

## Data migration policy

For future schema changes:

1. Add new nullable/default-compatible fields.
2. Backfill in bounded operations.
3. Add constraints after successful backfill.
4. Deploy compatible application code.
5. Remove deprecated fields only in a later release.

Never depend on manual Dashboard edits that are absent from migrations.
