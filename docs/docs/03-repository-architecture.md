# 03 — Repository architecture

Codex must preserve an existing repository structure when it is coherent. The following is the preferred target, not permission to rewrite the repository unnecessarily.

```text
/
├── src/
│   ├── app/                    # app bootstrap, providers, router
│   ├── components/             # reusable UI; no domain persistence logic
│   ├── features/
│   │   ├── auth/
│   │   ├── companies/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── candidates/
│   │   ├── evaluations/
│   │   ├── messages/
│   │   └── analytics/
│   ├── layouts/
│   ├── pages/                  # route composition only
│   ├── services/               # typed Supabase/RPC/Edge adapters
│   ├── lib/                    # clients, query keys, errors, utilities
│   ├── schemas/                # Zod schemas shared by UI boundaries
│   └── test/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── tests/
│   ├── seed.sql
│   └── config.toml
├── n8n/
│   ├── workflows/
│   ├── schemas/
│   └── README.md
├── docs/
├── public/
├── .env.example
└── package.json
```

## Feature module shape

A feature may contain:

```text
feature/
├── api/            # calls and DTO mapping
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
├── utils/
└── tests/
```

Do not create every directory preemptively. Add structure when a complete vertical slice needs it.

## Dependency direction

- `pages` may depend on feature public APIs and shared layout components.
- Feature UI may depend on feature hooks/schemas and shared components.
- Hooks may depend on services and query keys.
- Services may depend on the Supabase client, generated database types, and DTO validation.
- Presentational components must not import the Supabase client.
- Cross-feature dependencies should go through explicit public types/services, not internal file paths.

## Typed database access

Generate Supabase TypeScript types from the local/linked schema and commit them according to repository policy. Do not manually maintain a second full representation of database columns. Domain DTOs may narrow or reshape generated types when they prevent sensitive-field leakage.

## Mock-to-real migration

For each feature:

1. Identify its mock repository/data module.
2. Define the real contract and Zod schema.
3. Add migrations/RLS/functions if needed.
4. Add the service and query/mutation hooks.
5. Replace mock use in the complete route.
6. Delete unreachable mock code and fixtures that are not test fixtures.
7. Add loading, empty, permission, and error states.
8. Prove tenant isolation and behavior with tests.

Never mix mock and real records in the same production query path.

## Route map

Recommended routes:

```text
/                                   Landing page
/auth/sign-in
/auth/sign-up
/app                                Dashboard
/app/company                        Company settings and branding
/app/jobs
/app/jobs/new
/app/jobs/:jobId/edit
/app/jobs/:jobId/candidates
/app/applications/:applicationId
/app/members                        Owner/admin only
/careers/:companySlug
/careers/:companySlug/jobs/:jobSlug
/careers/:companySlug/jobs/:jobSlug/apply
/careers/:companySlug/application-confirmed
```

Use stable public slugs in URLs and UUIDs internally. Route guards improve UX but never replace RLS.
