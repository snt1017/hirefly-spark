# Canonical data dictionary

All timestamps are `timestamptz` in UTC. All tenant-owned tables include `company_id`. Add `created_at`/`updated_at` defaults and update triggers where specified. Enum names are suggestions; check constraints are acceptable when repository conventions prefer them.

## `profiles`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK, FK `auth.users(id)` |
| `full_name` | text | No | Product display name |
| `avatar_path` | text | Yes | Private/public policy defined by implementation |
| `locale` | text | No | default `es-CO` |
| `timezone` | text | No | default `America/Bogota` |
| `onboarding_completed_at` | timestamptz | Yes | Completion marker |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

## `companies`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `legal_name` | text | No | Internal/legal name |
| `internal_name` | text | No | Private display name |
| `status` | company_status | No | `active`, `suspended`, `archived` |
| `default_timezone` | text | No | default `America/Bogota` |
| `created_by` | uuid | No | FK `auth.users` |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

## `company_branding`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `company_id` | uuid | No | PK/FK `companies` |
| `public_slug` | citext | No | Global unique |
| `display_name` | text | No | Public name |
| `description` | text | Yes | Public description |
| `logo_path` | text | Yes | `company-assets` path |
| `primary_color` | text | No | Hex check; default `#04474b` |
| `secondary_color` | text | Yes | Hex check |
| `website_url` | text | Yes | Validated URL |
| `public_contact_email` | citext | Yes | Publishable contact |
| `careers_published` | boolean | No | default false |
| `seo_title` | text | Yes | Public metadata |
| `seo_description` | text | Yes | Public metadata |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

## `company_members`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | FK `companies` |
| `user_id` | uuid | No | FK `auth.users` |
| `role` | member_role | No | owner/admin/recruiter/viewer |
| `status` | member_status | No | invited/active/suspended |
| `invited_by` | uuid | Yes | FK `auth.users` |
| `joined_at` | timestamptz | Yes | Activation time |
| `created_at` | timestamptz | No | default `now()` |

Unique `(company_id, user_id)`.

## `company_invitations`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | FK |
| `email` | citext | No | Invitee |
| `role` | member_role | No | Requested role |
| `token_hash` | text | No | Never store raw token |
| `status` | invitation_status | No | pending/accepted/expired/revoked |
| `invited_by` | uuid | No | FK `auth.users` |
| `expires_at` | timestamptz | No | Expiration |
| `accepted_at` | timestamptz | Yes | Acceptance |
| `created_at` | timestamptz | No | default `now()` |

Recommended unique partial constraint for one pending invite per company/email.

## `jobs`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `slug` | citext | No | Unique per company |
| `title` | text | No | Public title |
| `department` | text | Yes | Filter field |
| `location` | text | Yes | Public location |
| `country_code` | char(2) | Yes | ISO country code |
| `work_mode` | work_mode | No | onsite/hybrid/remote |
| `contract_type` | contract_type | No | selected enum |
| `description` | text | No | Public description |
| `responsibilities` | text | Yes | Public content |
| `requirements` | text | Yes | Public content |
| `minimum_experience_months` | integer | Yes | >= 0 |
| `salary_min` | numeric(14,2) | Yes | >= 0 |
| `salary_max` | numeric(14,2) | Yes | >= salary_min |
| `salary_currency` | char(3) | Yes | Required with salary |
| `show_salary` | boolean | No | default false |
| `status` | job_status | No | draft/published/paused/closed/archived |
| `published_at` | timestamptz | Yes | Set by publish function |
| `closes_at` | timestamptz | Yes | Optional closing time |
| `created_by` | uuid | No | FK `auth.users` |
| `updated_by` | uuid | Yes | FK `auth.users` |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

Unique `(company_id, slug)` and unique `(company_id, id)` for composite FKs.

## `job_criteria`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `job_id` | uuid | No | Composite tenant-safe FK |
| `name` | text | No | Criterion label |
| `description` | text | No | Meaning |
| `criterion_type` | criterion_type | No | skill/experience/education/language/other |
| `is_required` | boolean | No | Required vs desirable |
| `weight` | numeric(5,2) | No | > 0 and <= 100 |
| `evidence_description` | text | Yes | Expected evidence |
| `fulfillment_condition` | text | Yes | Explicit rubric |
| `sort_order` | integer | No | >= 0; unique per job |
| `is_active` | boolean | No | default true |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

## `job_questions`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `job_id` | uuid | No | Tenant-safe FK |
| `question` | text | No | Public prompt |
| `answer_type` | answer_type | No | short_text/long_text/single/multiple/boolean |
| `is_required` | boolean | No | default false |
| `options` | jsonb | Yes | Validated array for option types |
| `sort_order` | integer | No | Unique per job |
| `is_active` | boolean | No | default true |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

## `candidates`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `full_name` | text | No | Current canonical name |
| `email` | citext | No | Current email |
| `normalized_email` | text | No | Generated/canonical normalized value |
| `phone` | text | Yes | Current phone |
| `city` | text | Yes | City |
| `country_code` | char(2) | Yes | ISO code |
| `linkedin_url` | text | Yes | Validated URL |
| `portfolio_url` | text | Yes | Validated URL |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

Unique `(company_id, normalized_email)` and `(company_id, id)`.

## `applications`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `candidate_id` | uuid | No | Tenant-safe FK |
| `job_id` | uuid | No | Tenant-safe FK |
| `applicant_name` | text | No | Submission snapshot |
| `applicant_email` | citext | No | Submission snapshot |
| `applicant_email_normalized` | text | No | Duplicate key |
| `applicant_phone` | text | Yes | Submission snapshot |
| `stage` | application_stage | No | Fixed V0 stage |
| `status` | application_status | No | active/withdrawn/archived |
| `source` | text | No | default `careers_site` |
| `applied_at` | timestamptz | No | Submission time |
| `last_activity_at` | timestamptz | No | Updated by important actions |
| `recruiter_score` | numeric(5,2) | Yes | Human override/support score |
| `recruiter_score_reason` | text | Yes | Required when score set |
| `recruiter_score_by` | uuid | Yes | FK `auth.users` |
| `recruiter_scored_at` | timestamptz | Yes | Audit timestamp |
| `withdrawn_at` | timestamptz | Yes | Candidate withdrawal |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

Unique `(company_id, job_id, applicant_email_normalized)`.

## `application_answers`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | No | Tenant-safe FK |
| `job_question_id` | uuid | No | Tenant-safe FK |
| `answer_text` | text | Yes | Text answer |
| `answer_json` | jsonb | Yes | Option/multi answer |
| `created_at` | timestamptz | No | default `now()` |

Unique `(application_id, job_question_id)`; require one answer representation.

## `application_consents`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | No | Tenant-safe FK |
| `consent_type` | text | No | e.g. privacy_processing |
| `policy_version` | text | No | Immutable version |
| `accepted` | boolean | No | Must be true for required consent |
| `accepted_at` | timestamptz | No | Time |
| `ip_hash` | text | Yes | Optional salted hash |
| `user_agent` | text | Yes | Truncated/minimized |
| `created_at` | timestamptz | No | default `now()` |

## `application_stage_history`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | No | Tenant-safe FK |
| `from_stage` | application_stage | Yes | Null for initial event |
| `to_stage` | application_stage | No | New stage |
| `changed_by` | uuid | Yes | Null/system only for initial submission |
| `reason` | text | Yes | Human reason |
| `created_at` | timestamptz | No | default `now()` |

## `resumes`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | No | Tenant-safe FK |
| `storage_path` | text | No | Unique object path |
| `original_filename` | text | No | Sanitized display name |
| `mime_type` | text | No | Server verified |
| `file_size_bytes` | bigint | No | > 0, <= configured max |
| `checksum_sha256` | text | Yes | Integrity/idempotency |
| `extracted_text` | text | Yes | Private; retention applies |
| `parsing_status` | parsing_status | No | pending/processing/completed/needs_review/failed |
| `parsing_error` | text | Yes | Sanitized |
| `uploaded_at` | timestamptz | No | Upload finalization |
| `parsed_at` | timestamptz | Yes | Completion |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

V0 unique `(application_id)` and unique `storage_path`.

## `candidate_profiles`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | No | Tenant-safe FK |
| `resume_id` | uuid | No | Tenant-safe FK |
| `version` | integer | No | > 0 |
| `headline` | text | Yes | Parsed |
| `summary` | text | Yes | Parsed |
| `experience` | jsonb | No | default `[]` |
| `education` | jsonb | No | default `[]` |
| `skills` | jsonb | No | default `[]` |
| `languages` | jsonb | No | default `[]` |
| `certifications` | jsonb | No | default `[]` |
| `links` | jsonb | No | default `[]` |
| `total_experience_months` | integer | Yes | >= 0 |
| `location` | text | Yes | Parsed |
| `missing_information` | jsonb | No | default `[]` |
| `warnings` | jsonb | No | default `[]` |
| `parser_provider` | text | No | e.g. ollama |
| `parser_model` | text | No | Model identifier |
| `parser_prompt_version` | text | No | Version |
| `raw_result` | jsonb | Yes | Private/debug, retention applies |
| `status` | profile_status | No | completed/failed/needs_review |
| `created_at` | timestamptz | No | default `now()` |

Unique `(application_id, version)`.

## `ai_evaluations`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | No | Tenant-safe FK |
| `job_id` | uuid | No | Tenant-safe FK |
| `candidate_profile_id` | uuid | No | Tenant-safe FK |
| `model_provider` | text | No | e.g. ollama |
| `model_name` | text | No | Model identifier |
| `prompt_version` | text | No | Version |
| `criteria_version` | text | No | Hash/version |
| `idempotency_key` | text | No | Unique per company |
| `total_score` | numeric(5,2) | Yes | 0–100, deterministic |
| `recommendation` | evaluation_recommendation | No | strong_review/review/low_priority_review/insufficient_information |
| `summary` | text | No | Decision support summary |
| `strengths` | jsonb | No | default `[]` |
| `gaps` | jsonb | No | default `[]` |
| `missing_information` | jsonb | No | default `[]` |
| `interview_questions` | jsonb | No | default `[]` |
| `warnings` | jsonb | No | default `[]` |
| `raw_result` | jsonb | Yes | Private; retention applies |
| `status` | evaluation_status | No | processing/completed/failed |
| `started_at` | timestamptz | Yes | Start |
| `completed_at` | timestamptz | Yes | Completion |
| `created_at` | timestamptz | No | default `now()` |

Unique `(company_id, idempotency_key)`.

## `ai_criterion_scores`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `ai_evaluation_id` | uuid | No | Tenant-safe FK |
| `job_criterion_id` | uuid | No | Tenant-safe FK |
| `criterion_name_snapshot` | text | No | Historical label |
| `criterion_weight_snapshot` | numeric(5,2) | No | Historical weight |
| `status` | criterion_status | No | met/partially_met/not_met/unknown |
| `score` | numeric(5,2) | No | 0–100 |
| `confidence` | numeric(4,3) | No | 0–1 |
| `evidence` | jsonb | No | concise list |
| `explanation` | text | No | Evidence-based |
| `created_at` | timestamptz | No | default `now()` |

Unique `(ai_evaluation_id, job_criterion_id)`.

## `candidate_notes`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | No | Tenant-safe FK |
| `user_id` | uuid | No | FK `auth.users` |
| `content` | text | No | Private note |
| `is_private` | boolean | No | default true |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

## `candidate_messages`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | No | Tenant-safe FK |
| `created_by` | uuid | No | FK `auth.users` |
| `channel` | message_channel | No | email in V0 |
| `recipient` | citext | No | Snapshot |
| `subject` | text | No | Draft/sent subject |
| `content` | text | No | Draft/sent body |
| `status` | message_status | No | draft/approved/queued/sent/failed/cancelled |
| `provider_message_id` | text | Yes | SMTP/provider ID |
| `approved_by` | uuid | Yes | FK `auth.users` |
| `approved_at` | timestamptz | Yes | Approval |
| `sent_at` | timestamptz | Yes | Send time |
| `error` | text | Yes | Sanitized failure |
| `idempotency_key` | text | No | Unique per company |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

Unique `(company_id, idempotency_key)`.

## `activity_logs`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `actor_user_id` | uuid | Yes | Human actor when applicable |
| `actor_type` | actor_type | No | user/system/worker |
| `entity_type` | text | No | Allow-listed domain type |
| `entity_id` | uuid | No | Domain ID |
| `action` | text | No | Allow-listed action |
| `metadata` | jsonb | No | Sanitized allow-listed values |
| `request_id` | uuid | Yes | Correlation |
| `ip_hash` | text | Yes | Optional, never raw IP by default |
| `created_at` | timestamptz | No | default `now()` |

Append-only for ordinary users.

## `processing_jobs`

| Column | Type | Null | Rules / purpose |
|---|---|---:|---|
| `id` | uuid | No | PK |
| `company_id` | uuid | No | Tenant FK |
| `application_id` | uuid | Yes | Tenant-safe FK when applicable |
| `job_type` | processing_job_type | No | resume_parse/candidate_evaluation/follow_up_draft/send_email/application_confirmation |
| `status` | processing_job_status | No | pending/processing/completed/failed/cancelled |
| `priority` | integer | No | default 0 |
| `attempts` | integer | No | default 0 |
| `max_attempts` | integer | No | > 0 |
| `available_at` | timestamptz | No | claim eligibility |
| `locked_at` | timestamptz | Yes | Lock time |
| `locked_by` | text | Yes | Worker ID |
| `lock_expires_at` | timestamptz | Yes | Recovery boundary |
| `idempotency_key` | text | No | Unique per company |
| `payload` | jsonb | No | Validated by type |
| `result` | jsonb | Yes | Sanitized summary |
| `last_error` | text | Yes | Sanitized |
| `started_at` | timestamptz | Yes | First/current start |
| `completed_at` | timestamptz | Yes | Terminal success |
| `created_at` | timestamptz | No | default `now()` |
| `updated_at` | timestamptz | No | default `now()` |

Unique `(company_id, idempotency_key)`. Partial claim index on `(priority desc, available_at, created_at)` where `status = 'pending'`.
