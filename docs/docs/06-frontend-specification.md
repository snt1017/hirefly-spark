# 06 — Frontend specification

## Design system

- Private product UI: light, neutral, professional B2B SaaS design.
- Hirefly accent: `#04474b`.
- Public careers pages: dynamically use validated company primary/secondary colors.
- Avoid excessive gradients, decorative cards, and motion.
- Responsive from mobile to desktop.
- Respect reduced-motion preferences.

## Application shell

Private shell includes company selector, primary navigation, user menu, contextual page title, and clear permission-aware actions. A viewer may see content but must not see enabled mutation controls.

## Required screens

### Public

- Landing page.
- Careers home with company branding and job filters.
- Job detail.
- Application form.
- Application confirmation.

### Authentication

- Sign in.
- Sign up.
- Recovery/update flows if enabled in project scope.

### Private

- Company onboarding.
- Dashboard.
- Company branding/settings with careers preview.
- Job list and lifecycle actions.
- Job editor with criteria and questions.
- Candidate list by job.
- Candidate detail with tabs/sections for overview, resume/profile, evaluation, notes, messages, and activity.
- Member administration for owner/admin.
- Basic analytics.

## Data access pattern

- One configured Supabase client module.
- Feature services expose typed methods.
- Service responses are mapped through Zod where the boundary is not fully generated/typed.
- TanStack Query keys include active company ID: e.g. `['applications', companyId, jobId, filters]`.
- Mutations invalidate the narrowest correct queries.
- Never place the service-role key or privileged internal endpoint in browser environment variables.

## Form behavior

- Client validation improves UX; server/database validation remains authoritative.
- Preserve unsaved draft state when safe.
- Criteria editor displays active weight total and publishing requirements.
- Resume input validates extension/MIME/size before upload but does not trust client metadata.
- Application consent must be explicit and versioned.
- Submission uses clear progress states for application creation and file upload/finalization.

## Candidate evaluation presentation

- Label: “AI-assisted review” or equivalent, never “decision”.
- Show total score with methodology notice.
- Show each criterion's status, score, confidence, evidence, and explanation.
- Distinguish `unknown` from `not_met` visually and semantically.
- Display strengths, gaps, missing information, interview questions, and warnings.
- Show model/prompt version in a technical details area, not as primary UI.
- Provide reprocess action only to authorized roles.

## Required UI states

Every server-driven view includes:

- loading/skeleton,
- empty state with next action,
- recoverable error with retry,
- not authenticated,
- forbidden,
- stale or processing state,
- success confirmation for mutations.

## Accessibility acceptance

- Form controls have programmatic labels and error descriptions.
- Dialogs trap focus and restore it.
- Menus and tables are keyboard operable.
- Status is not communicated by color alone.
- Dynamic processing updates use appropriate live regions without excessive announcements.
- Public brand colors are normalized/validated to preserve contrast; fall back to safe defaults when invalid.
