# 02 — System architecture

## Context diagram

```mermaid
flowchart LR
  Candidate[Candidate] --> Public[Public careers UI]
  Recruiter[Recruiter] --> Private[Private dashboard]
  Public --> Supabase[Supabase API / Edge Functions]
  Private --> Supabase
  Supabase --> Postgres[(PostgreSQL)]
  Supabase --> Auth[Auth]
  Supabase --> Storage[Storage]
  Postgres --> Jobs[processing_jobs]
  Jobs --> N8N[n8n Community]
  N8N --> Tika[Apache Tika]
  N8N --> Ollama[Ollama]
  N8N --> SMTP[SMTP]
  N8N --> Supabase
  Lovable[Lovable] -. build-time only .-> Repo[Git repository]
  Codex[Codex] -. build-time only .-> Repo
  Repo --> Public
  Repo --> Private
```

## Runtime boundaries

### Browser

Owns rendering, form interaction, authenticated user session, accessible feedback, and calls to approved Supabase/RPC/Edge contracts. It does not own authorization, canonical state, secrets, weighted scoring, or processing retries.

### Supabase

Owns authentication, canonical relational state, row authorization, object metadata, private storage, controlled functions, public Edge endpoints, and durable processing jobs.

### n8n

Owns orchestration of asynchronous steps. It claims a job, retrieves required data, calls Tika/Ollama/SMTP, validates responses, writes results, records activity, and updates the job. It does not become the source of truth.

### Apache Tika

Accepts an internal document request and returns extracted text/metadata. It must not be publicly exposed. Input is untrusted and resource limits are required.

### Ollama

Runs selected local models behind an adapter. The adapter accepts task input and an expected JSON Schema. Model-specific request details do not leak through the domain layer.

### SMTP

Sends approved email. Credentials remain server-side. A provider message identifier is stored when available.

## Main application flow

```mermaid
sequenceDiagram
  participant C as Candidate
  participant UI as Public UI
  participant EF as Edge Function
  participant DB as PostgreSQL
  participant S as Storage
  participant N as n8n
  participant T as Tika
  participant O as Ollama

  C->>UI: Submit form and resume
  UI->>EF: Validated application request
  EF->>DB: Create candidate/application/consent
  EF->>S: Authorize exact private upload path
  UI->>S: Upload resume
  UI->>EF: Finalize upload
  EF->>DB: Create resume metadata and processing job
  EF-->>UI: Confirmation
  N->>DB: Atomically claim resume_parse job
  N->>S: Request short-lived signed URL
  N->>T: Extract text
  T-->>N: Text
  N->>O: Parse resume using schema
  O-->>N: Structured JSON
  N->>DB: Store candidate profile version
  N->>DB: Enqueue candidate_evaluation
  N->>O: Evaluate explicit criteria using schema
  O-->>N: Criterion results
  N->>N: Deterministic weighted score
  N->>DB: Store evaluation and criterion rows
```

## Data ownership

- Auth credentials and sessions: Supabase Auth.
- Product user profile: `profiles`.
- Tenant membership and role: `company_members`.
- Canonical business state: PostgreSQL tables.
- Resume bytes: private Supabase Storage.
- Resume metadata and extracted text: PostgreSQL, subject to retention policy.
- Workflow execution data: n8n operational storage, minimized; canonical status remains in PostgreSQL.
- AI model files: Ollama runtime.

## Deployment topology

For V0, a single environment may host the frontend, n8n, Tika, and Ollama with Supabase managed or local/self-hosted. Keep service networking private where possible. Production must separate public ingress from internal services and must not expose Tika, Ollama, the database, or n8n editor endpoints to unauthenticated public traffic.

## Scalability posture

V0 optimizes for correctness and portability, not maximum throughput. The `processing_jobs` abstraction allows additional n8n workers later. Database indexes prioritize job claims, tenant/job candidate lists, evaluation history, message status, and activity history. Avoid speculative GIN indexes until query evidence exists.
