# Hirefly MVP V0 — Codex Documentation Pack

**Generated:** 2026-07-21  
**Documentation language:** English  
**Product:** Hirefly  
**Purpose:** Give a coding agent a precise, implementation-oriented source of truth for the MVP V0.

Hirefly is a multi-tenant B2B recruiting platform that lets companies publish branded job pages, receive applications, store resumes privately, structure resume information with local AI, evaluate candidates against explicit job criteria, and support a human recruiter through an auditable pipeline.

## Start here

1. Read [`AGENTS.md`](AGENTS.md). It contains the binding instructions for Codex.
2. Read [`PROJECT_MANIFEST.yaml`](PROJECT_MANIFEST.yaml) for machine-readable constraints.
3. Read the documents in `docs/` in numeric order.
4. Use `database/`, `contracts/`, `schemas/`, and `prompts/` while implementing the relevant vertical slice.
5. Use the checklists before declaring a task complete.

## Canonical decisions

- The frontend is React + TypeScript + Vite, with Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, and Zod.
- Supabase is the canonical backend for PostgreSQL, Auth, Storage, RLS, RPC, and Edge Functions.
- n8n Community Edition orchestrates asynchronous workflows but never owns canonical business state.
- Ollama runs local or self-hosted models and must return schema-validated structured outputs.
- Apache Tika extracts text from supported resume documents.
- SMTP sends email after human approval.
- Every tenant-owned record carries `company_id`; authorization is enforced in PostgreSQL with RLS.
- AI is decision support only. It never automatically rejects or hires a candidate.
- Resume content is untrusted input and must never be treated as instructions.
- The runtime must not depend on Lovable or Codex.

## Current-state assumption

The existing frontend may be a Lovable-generated mock prototype without Supabase integration. Codex must inspect the repository before editing it. A feature is considered migrated only when its mock data path is removed, its real service path is implemented, its authorization is enforced, and its tests pass.

## Package map

- `docs/`: product, architecture, security, quality, roadmap, and operational guidance.
- `database/`: canonical data dictionary, migration plan, seed plan, and RLS test matrix.
- `contracts/`: public functions, asynchronous jobs, activity events, and error conventions.
- `schemas/`: JSON Schemas for AI outputs and job payloads.
- `prompts/`: model prompts and coding prompts.
- `checklists/`: task, pull request, definition-of-done, and release checklists.
- `references/`: original Spanish source documents and official documentation links.

## Conflict resolution order

When documents conflict, use this order:

1. `AGENTS.md`
2. `PROJECT_MANIFEST.yaml`
3. Canonical data model in `database/data-dictionary.md`
4. Contracts and JSON Schemas
5. Numbered architecture and product documents
6. Original source documents in `references/`

Any unresolved conflict must be recorded in an ADR or in `docs/15-decisions-and-open-questions.md`; do not silently choose a behavior that changes security, data ownership, public API shape, or MVP scope.
