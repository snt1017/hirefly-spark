# Seed plan

Local seed data should be deterministic, clearly non-production, and safe to reset.

## Suggested fixtures

- Two companies with distinct branding.
- Owner, recruiter, and viewer users per company.
- One public and one draft job per company.
- 4–6 criteria per public job totaling 100.
- Two job questions.
- Candidate/application examples in several stages.
- One completed candidate profile/evaluation and one failed processing job.
- One draft and one sent message.

## Rules

- Never include real personal information.
- Use reserved example domains such as `example.com`.
- Do not commit real Auth passwords; use documented local testing creation methods.
- Keep IDs deterministic where tests depend on them, or expose fixture lookup helpers.
- Seed storage with tiny synthetic files only when necessary for E2E.
- Seed AI raw data must be synthetic and clearly marked.
