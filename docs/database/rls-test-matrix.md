# RLS and tenant-isolation test matrix

Create fixtures for:

- Company A: owner A, admin A, recruiter A, viewer A.
- Company B: owner B, recruiter B.
- Unaffiliated authenticated user.
- Anonymous user.

For every tenant-owned table, test direct API/SQL behavior under JWT context.

| Resource | Anonymous | Unaffiliated | Viewer same tenant | Recruiter same tenant | Admin/Owner | Other tenant |
|---|---|---|---|---|---|---|
| `companies` private fields | deny | deny | select | select | select/update by policy | deny |
| `company_branding` private mutation | public function only | deny | select | select | update | deny |
| `company_members` | deny | own invite flow only | limited/select if intended | limited | manage | deny |
| `jobs` private table | public function only | deny | select | CRUD/lifecycle | CRUD/lifecycle | deny |
| `job_criteria`, `job_questions` | public questions only via function | deny | select | CRUD | CRUD | deny |
| `candidates`, `applications` | deny | deny | select | select/update pipeline | select/update | deny |
| `answers`, `consents`, history | deny | deny | select | select / allowed actions | select / allowed actions | deny |
| `resumes` metadata | deny | deny | select | select | select | deny |
| `candidate_profiles`, evaluations | deny | deny | select | select/reprocess | select/reprocess | deny |
| `candidate_notes` | deny | deny | select if role policy allows | CRUD own/tenant | CRUD | deny |
| `candidate_messages` | deny | deny | select | create/approve | create/approve | deny |
| `activity_logs` | deny | deny | select | select | select | deny |
| `processing_jobs` | deny | deny | selected status only if UI needs | retry via function | retry via function | deny |

## Required adversarial cases

- Change `company_id` in insert payload.
- Reference Company B job from Company A application.
- Request known Company B UUID.
- Use viewer token for mutation RPC.
- Call security-definer function with another company ID.
- Attempt storage path traversal or another company's path.
- Attempt anonymous table select instead of public RPC.
- Attempt to insert evaluation directly as authenticated recruiter.
- Attempt to update append-only activity log.
- Suspend membership and retry previously allowed action.

Every new policy or helper change adds a regression test.
