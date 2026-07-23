# Hirefly Data Dictionary

**Version:** MVP V0  
**Database:** Supabase PostgreSQL  
**Schema language:** English  
**Generated:** 2026-07-21

## 1. Purpose and scope

This dictionary documents the database objects created by `hirefly_supabase_schema.sql`. The design is multi-tenant, uses Supabase Auth as the canonical identity source, stores files in Supabase Storage, keeps PostgreSQL as the source of truth, and uses `processing_jobs` as the durable asynchronous work queue for n8n.

The schema contains **21 application tables**, **23 enum types**, tenant-isolation policies, Storage policies, integrity triggers, public read RPCs, controlled application intake, and worker job-claim functions.

## 2. Core conventions

- All tenant-owned rows contain `company_id` directly.
- `auth.users.id` is the canonical user identity. Passwords, sessions, identities, and tokens are not copied into `public`.
- Critical relationships use `(company_id, id)` foreign keys to prevent cross-tenant references.
- Candidate identity is tenant-scoped. The same email may exist in different companies.
- Applications preserve applicant name, email, and phone snapshots from submission time.
- Resume parsing and AI evaluation outputs are versioned rather than overwritten.
- The final AI score is deterministic and stored as decision support, not as an automatic hiring decision.
- Public users read only limited company/job fields through RPC functions. They do not query private tables directly.
- n8n uses service-role-only RPCs and idempotency keys for asynchronous processing.

## 3. Data classification

| Table | Classification |
|---|---|
| `profiles` | Internal personal data |
| `companies` | Internal business data |
| `company_branding` | Public configuration |
| `company_members` | Restricted authorization data |
| `company_invitations` | Restricted authorization data |
| `jobs` | Internal; selected fields public through RPC |
| `job_criteria` | Internal evaluation configuration |
| `job_questions` | Internal; active fields public through RPC |
| `candidates` | Restricted personal data |
| `applications` | Restricted personal and recruiting data |
| `application_answers` | Restricted applicant data |
| `application_consents` | Restricted compliance data |
| `application_stage_history` | Restricted recruiting history |
| `resumes` | Highly restricted document and extracted personal data |
| `candidate_profiles` | Highly restricted structured personal data |
| `ai_evaluations` | Restricted decision-support data |
| `ai_criterion_scores` | Restricted decision-support data |
| `candidate_notes` | Highly restricted internal notes |
| `candidate_messages` | Restricted communications |
| `activity_logs` | Restricted audit data |
| `processing_jobs` | Restricted operational data |

## 4. Enumerated types

| Type | Allowed values |
|---|---|
| `company_status` | `active`, `suspended`, `archived` |
| `member_role` | `owner`, `admin`, `recruiter`, `viewer` |
| `member_status` | `invited`, `active`, `suspended` |
| `invitation_status` | `pending`, `accepted`, `revoked`, `expired` |
| `work_mode` | `onsite`, `hybrid`, `remote` |
| `contract_type` | `full_time`, `part_time`, `contractor`, `temporary`, `internship`, `other` |
| `job_status` | `draft`, `published`, `paused`, `closed`, `archived` |
| `criterion_type` | `experience`, `skill`, `education`, `language`, `certification`, `other` |
| `answer_type` | `short_text`, `long_text`, `single_select`, `multi_select`, `boolean`, `number`, `url` |
| `application_stage` | `new`, `pending_review`, `shortlisted`, `contacted`, `interview`, `assessment`, `offer`, `hired`, `rejected` |
| `application_status` | `active`, `hired`, `rejected`, `withdrawn`, `archived` |
| `application_source` | `careers_page`, `recruiter_referral`, `internal`, `other` |
| `parsing_status` | `pending`, `processing`, `completed`, `failed`, `needs_review` |
| `candidate_profile_status` | `completed`, `failed`, `needs_review` |
| `evaluation_status` | `pending`, `processing`, `completed`, `failed` |
| `evaluation_recommendation` | `strong_review`, `review`, `low_priority_review`, `insufficient_information` |
| `criterion_match_status` | `met`, `partially_met`, `not_met`, `unknown` |
| `message_channel` | `email` |
| `message_status` | `draft`, `approved`, `queued`, `sent`, `failed`, `cancelled` |
| `actor_type` | `user`, `service`, `system`, `public` |
| `processing_job_type` | `resume_parse`, `candidate_evaluation`, `application_confirmation`, `candidate_follow_up`, `send_email`, `notification`, `data_cleanup` |
| `processing_job_status` | `pending`, `running`, `completed`, `failed`, `cancelled` |
| `consent_type` | `privacy_policy`, `data_processing`, `communications` |

## 5. Tables

### 5.1 `profiles`

Product-level profile extending `auth.users`; authorization remains in company memberships.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key references auth.users(id) on delete cascade` | Primary UUID identifier. |
| `full_name` | `text not null default ''` | User display name for the Hirefly product. |
| `avatar_path` | `text` | Optional Storage path for the user avatar. |
| `locale` | `text not null default 'en'` | Preferred UI locale. |
| `timezone` | `text not null default 'America/Bogota'` | Preferred IANA time zone. |
| `onboarding_completed_at` | `timestamptz` | Timestamp when user onboarding was completed. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint profiles_full_name_length check (char_length(full_name) <= 200)`
- `constraint profiles_locale_length check (char_length(locale) between 2 and 20)`
- `constraint profiles_timezone_length check (char_length(timezone) between 1 and 100)`

### 5.2 `companies`

Private tenant record for each customer organization.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `legal_name` | `text not null` | Registered legal organization name. |
| `internal_name` | `text not null` | Name shown inside the private dashboard. |
| `status` | `public.company_status not null default 'active'` | Current lifecycle status. |
| `default_timezone` | `text not null default 'America/Bogota'` | Default IANA time zone for company operations. |
| `created_by` | `uuid not null references auth.users(id) on delete restrict` | Auth user who created the company and initially becomes owner. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint companies_legal_name_not_blank check (btrim(legal_name) <> '')`
- `constraint companies_internal_name_not_blank check (btrim(internal_name) <> '')`
- `constraint companies_timezone_length check (char_length(default_timezone) between 1 and 100)`

### 5.3 `company_branding`

Public careers-site identity and visual configuration separated from private company data.

| Column | SQL definition | Description |
|---|---|---|
| `company_id` | `uuid primary key references public.companies(id) on delete cascade` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `public_slug` | `citext not null unique` | Globally unique case-insensitive slug used in the careers URL. |
| `display_name` | `text not null` | Public company name shown to candidates. |
| `description` | `text` | Public company description. |
| `logo_path` | `text` | Storage path for the public logo. |
| `primary_color` | `text not null default '#04474b'` | Primary public careers-site color in six-digit hexadecimal format. |
| `secondary_color` | `text not null default '#ffffff'` | Secondary public careers-site color in six-digit hexadecimal format. |
| `website_url` | `text` | Public company website. |
| `public_contact_email` | `citext` | Public recruiting contact email. |
| `careers_published` | `boolean not null default false` | Controls whether public careers RPCs return the company. |
| `seo_title` | `text` | Optional search-result title. |
| `seo_description` | `text` | Optional search-result description. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint company_branding_slug_format check (public_slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')`
- `constraint company_branding_display_name_not_blank check (btrim(display_name) <> '')`
- `constraint company_branding_primary_color_hex check (primary_color ~ '^#[0-9A-Fa-f]{6}$')`
- `constraint company_branding_secondary_color_hex check (secondary_color ~ '^#[0-9A-Fa-f]{6}$')`
- `constraint company_branding_seo_title_length check (seo_title is null or char_length(seo_title) <= 70)`
- `constraint company_branding_seo_description_length check (seo_description is null or char_length(seo_description) <= 180)`

### 5.4 `company_members`

Many-to-many membership between Auth users and companies, including tenant role and status.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null references public.companies(id) on delete cascade` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `user_id` | `uuid not null references auth.users(id) on delete cascade` | Supabase Auth user identifier. |
| `role` | `public.member_role not null` | Tenant role: owner, admin, recruiter, or viewer. |
| `status` | `public.member_status not null default 'invited'` | Membership status: invited, active, or suspended. |
| `invited_by` | `uuid references auth.users(id) on delete set null` | Auth user who invited the member. |
| `joined_at` | `timestamptz` | Timestamp when membership became active. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint company_members_company_user_unique unique (company_id, user_id)`
- `constraint company_members_company_id_id_unique unique (company_id, id)`
- `constraint company_members_joined_state check ( (status = 'active' and joined_at is not null) or (status <> 'active') )`

### 5.5 `company_invitations`

Hashed, expiring invitations for users who may not yet have an Auth account.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null references public.companies(id) on delete cascade` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `email` | `citext not null` | Case-insensitive invited email address. |
| `role` | `public.member_role not null` | Role assigned when the invitation is accepted. |
| `token_hash` | `text not null unique` | Hash of the invitation token; the raw token must never be stored. |
| `status` | `public.invitation_status not null default 'pending'` | Current lifecycle status. |
| `invited_by` | `uuid not null references auth.users(id) on delete restrict` | Auth user who issued the invitation. |
| `expires_at` | `timestamptz not null` | Invitation expiration timestamp. |
| `accepted_at` | `timestamptz` | Timestamp when the invitation was accepted. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint company_invitations_email_not_blank check (btrim(email::text) <> '')`
- `constraint company_invitations_expiry_after_creation check (expires_at > created_at)`
- `constraint company_invitations_acceptance_state check ( (status = 'accepted' and accepted_at is not null) or (status <> 'accepted') )`
- `constraint company_invitations_company_id_id_unique unique (company_id, id)`

### 5.6 `jobs`

Recruiting positions, publication state, job content, salary settings, and criteria version.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null references public.companies(id) on delete cascade` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `slug` | `citext not null` | Case-insensitive job slug unique within the company. |
| `title` | `text not null` | Public position title. |
| `department` | `text` | Optional department or functional area. |
| `location` | `text not null` | Public job location label. |
| `country_code` | `char(2)` | Optional ISO 3166-1 alpha-2 country code. |
| `work_mode` | `public.work_mode not null` | Onsite, hybrid, or remote. |
| `contract_type` | `public.contract_type not null` | Employment or engagement type. |
| `description` | `text not null` | Main public job description. |
| `responsibilities` | `text` | Optional responsibilities section. |
| `requirements` | `text` | Optional consolidated requirements section. |
| `minimum_experience_months` | `integer` | Minimum experience requested, in months. |
| `salary_min` | `numeric(14,2)` | Optional lower salary bound. |
| `salary_max` | `numeric(14,2)` | Optional upper salary bound. |
| `salary_currency` | `char(3)` | ISO 4217 currency code. |
| `show_salary` | `boolean not null default false` | Controls whether salary fields are returned by public RPCs. |
| `allow_no_required_criteria` | `boolean not null default false` | Explicit waiver permitting publication with no required criteria. |
| `criteria_version` | `integer not null default 1` | Monotonic version incremented whenever criteria change. |
| `status` | `public.job_status not null default 'draft'` | Current lifecycle status. |
| `published_at` | `timestamptz` | First publication timestamp. |
| `closes_at` | `timestamptz` | Optional application closing timestamp. |
| `created_by` | `uuid not null references auth.users(id) on delete restrict` | Auth user who created the record. |
| `updated_by` | `uuid references auth.users(id) on delete set null` | Auth user who last updated the record. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint jobs_company_slug_unique unique (company_id, slug)`
- `constraint jobs_company_id_id_unique unique (company_id, id)`
- `constraint jobs_slug_format check (slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')`
- `constraint jobs_title_not_blank check (btrim(title) <> '')`
- `constraint jobs_location_not_blank check (btrim(location) <> '')`
- `constraint jobs_description_not_blank check (btrim(description) <> '')`
- `constraint jobs_country_code_uppercase check (country_code is null or country_code ~ '^[A-Z]{2}$')`
- `constraint jobs_minimum_experience_nonnegative check (minimum_experience_months is null or minimum_experience_months >= 0)`
- `constraint jobs_salary_min_nonnegative check (salary_min is null or salary_min >= 0)`
- `constraint jobs_salary_max_valid check (salary_max is null or (salary_max >= 0 and (salary_min is null or salary_max >= salary_min)))`
- `constraint jobs_salary_currency_format check (salary_currency is null or salary_currency ~ '^[A-Z]{3}$')`
- `constraint jobs_salary_visibility_complete check ( not show_salary or (salary_min is not null and salary_max is not null and salary_currency is not null) )`
- `constraint jobs_published_state check ( (status = 'published' and published_at is not null) or status <> 'published' )`
- `constraint jobs_closing_date_valid check (closes_at is null or closes_at > created_at)`
- `constraint jobs_criteria_version_positive check (criteria_version >= 1)`

### 5.7 `job_criteria`

Weighted, explainable evaluation criteria configured for a job.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `job_id` | `uuid not null` | Job identifier. |
| `name` | `text not null` | Short criterion label. |
| `description` | `text not null` | Detailed definition used by recruiters and the evaluation workflow. |
| `criterion_type` | `public.criterion_type not null` | Criterion category. |
| `is_required` | `boolean not null default false` | Distinguishes mandatory from desirable criteria. |
| `weight` | `numeric(5,2) not null` | Percentage contribution to the deterministic weighted score. |
| `evidence_description` | `text` | Description of acceptable supporting evidence. |
| `fulfillment_condition` | `text` | Explicit condition for considering the criterion fulfilled. |
| `sort_order` | `integer not null` | Display and processing order within the parent record. |
| `is_active` | `boolean not null default true` | Whether the record participates in active product behavior. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint job_criteria_job_same_company_fk foreign key (company_id, job_id) references public.jobs(company_id, id) on delete cascade`
- `constraint job_criteria_company_id_id_unique unique (company_id, id)`
- `constraint job_criteria_job_sort_order_unique unique (job_id, sort_order)`
- `constraint job_criteria_name_not_blank check (btrim(name) <> '')`
- `constraint job_criteria_description_not_blank check (btrim(description) <> '')`
- `constraint job_criteria_weight_range check (weight > 0 and weight <= 100)`
- `constraint job_criteria_sort_order_nonnegative check (sort_order >= 0)`

### 5.8 `job_questions`

Questions shown on the public application form for a job.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `job_id` | `uuid not null` | Job identifier. |
| `question` | `text not null` | Candidate-facing question text. |
| `answer_type` | `public.answer_type not null` | Expected answer format. |
| `is_required` | `boolean not null default false` | Whether an answer is mandatory. |
| `options` | `jsonb` | JSON array of choices for select-type questions. |
| `sort_order` | `integer not null` | Display and processing order within the parent record. |
| `is_active` | `boolean not null default true` | Whether the record participates in active product behavior. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint job_questions_job_same_company_fk foreign key (company_id, job_id) references public.jobs(company_id, id) on delete cascade`
- `constraint job_questions_company_id_id_unique unique (company_id, id)`
- `constraint job_questions_job_sort_order_unique unique (job_id, sort_order)`
- `constraint job_questions_question_not_blank check (btrim(question) <> '')`
- `constraint job_questions_sort_order_nonnegative check (sort_order >= 0)`
- `constraint job_questions_options_shape check ( options is null or jsonb_typeof(options) = 'array' )`
- `constraint job_questions_select_options_required check ( answer_type not in ('single_select', 'multi_select') or (options is not null and jsonb_array_length(options) > 0) )`

### 5.9 `candidates`

A person inside one tenant; unique by normalized email within that company.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null references public.companies(id) on delete cascade` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `full_name` | `text not null` | Current candidate name inside the tenant. |
| `email` | `citext not null` | Current case-insensitive candidate email. |
| `normalized_email` | `text generated always as (lower(btrim(email::text))) stored` | Generated lowercase, trimmed email used for tenant-scoped uniqueness. |
| `phone` | `text` | Optional phone number. |
| `city` | `text` | Optional city. |
| `country_code` | `char(2)` | Optional ISO 3166-1 alpha-2 country code. |
| `linkedin_url` | `text` | Optional LinkedIn profile URL. |
| `portfolio_url` | `text` | Optional portfolio URL. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint candidates_company_email_unique unique (company_id, normalized_email)`
- `constraint candidates_company_id_id_unique unique (company_id, id)`
- `constraint candidates_full_name_not_blank check (btrim(full_name) <> '')`
- `constraint candidates_email_not_blank check (btrim(email::text) <> '')`
- `constraint candidates_country_code_uppercase check (country_code is null or country_code ~ '^[A-Z]{2}$')`

### 5.10 `applications`

A candidate submission to one job, including immutable contact snapshots and current pipeline state.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `candidate_id` | `uuid not null` | Candidate identifier. |
| `job_id` | `uuid not null` | Job identifier. |
| `applicant_name` | `text not null` | Name snapshot captured at application time. |
| `applicant_email` | `citext not null` | Email snapshot captured at application time. |
| `applicant_email_normalized` | `text generated always as (lower(btrim(applicant_email::text))) stored` | Generated normalized application email used to prevent duplicate submissions per job. |
| `applicant_phone` | `text` | Phone snapshot captured at application time. |
| `stage` | `public.application_stage not null default 'new'` | Current recruiting pipeline stage. |
| `status` | `public.application_status not null default 'active'` | Overall application lifecycle state. |
| `source` | `public.application_source not null default 'careers_page'` | Application acquisition source. |
| `applied_at` | `timestamptz not null default now()` | Candidate submission timestamp. |
| `last_activity_at` | `timestamptz not null default now()` | Timestamp used to sort recently active applications. |
| `recruiter_score` | `numeric(5,2)` | Optional human score from 0 to 100. |
| `recruiter_score_reason` | `text` | Human explanation for the recruiter score. |
| `recruiter_score_by` | `uuid references auth.users(id) on delete set null` | Auth user who assigned the human score. |
| `recruiter_scored_at` | `timestamptz` | Timestamp when the human score was assigned. |
| `withdrawn_at` | `timestamptz` | Timestamp when the candidate withdrew. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint applications_candidate_same_company_fk foreign key (company_id, candidate_id) references public.candidates(company_id, id) on delete restrict`
- `constraint applications_job_same_company_fk foreign key (company_id, job_id) references public.jobs(company_id, id) on delete restrict`
- `constraint applications_company_job_email_unique unique (company_id, job_id, applicant_email_normalized)`
- `constraint applications_company_id_id_unique unique (company_id, id)`
- `constraint applications_applicant_name_not_blank check (btrim(applicant_name) <> '')`
- `constraint applications_applicant_email_not_blank check (btrim(applicant_email::text) <> '')`
- `constraint applications_recruiter_score_range check (recruiter_score is null or recruiter_score between 0 and 100)`
- `constraint applications_recruiter_score_state check ( (recruiter_score is null and recruiter_score_by is null and recruiter_scored_at is null) or (recruiter_score is not null and recruiter_score_by is not null and recruiter_scored_at is not null) )`
- `constraint applications_withdrawn_state check ( (status = 'withdrawn' and withdrawn_at is not null) or status <> 'withdrawn' )`

### 5.11 `application_answers`

Answers submitted for job-specific application questions.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid not null` | Application identifier. |
| `job_question_id` | `uuid not null` | Question answered; a trigger ensures it belongs to the application job. |
| `answer_text` | `text` | Scalar or long-form answer. |
| `answer_json` | `jsonb` | Structured answer for multi-select or richer formats. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint application_answers_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint application_answers_question_same_company_fk foreign key (company_id, job_question_id) references public.job_questions(company_id, id) on delete restrict`
- `constraint application_answers_application_question_unique unique (application_id, job_question_id)`
- `constraint application_answers_has_value check (answer_text is not null or answer_json is not null)`

### 5.12 `application_consents`

Versioned privacy, data-processing, and communications consent records.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid not null` | Application identifier. |
| `consent_type` | `public.consent_type not null` | Privacy, data-processing, or communications consent. |
| `policy_version` | `text not null` | Version of the accepted policy text. |
| `accepted` | `boolean not null` | Whether consent was granted. |
| `accepted_at` | `timestamptz` | Timestamp when consent was granted. |
| `ip_hash` | `text` | Optional non-reversible hash of the originating IP. |
| `user_agent` | `text` | Optional browser user-agent captured for compliance evidence. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |

**Table-level constraints**

- `constraint application_consents_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint application_consents_application_type_version_unique unique (application_id, consent_type, policy_version)`
- `constraint application_consents_policy_version_not_blank check (btrim(policy_version) <> '')`
- `constraint application_consents_acceptance_state check ( (accepted and accepted_at is not null) or (not accepted) )`

### 5.13 `application_stage_history`

Append-only history of application pipeline transitions.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid not null` | Application identifier. |
| `from_stage` | `public.application_stage` | Previous stage; null for the initial history entry. |
| `to_stage` | `public.application_stage not null` | New stage. |
| `changed_by` | `uuid references auth.users(id) on delete set null` | Auth user who changed the stage; null for system/service changes. |
| `reason` | `text` | Optional human-entered transition reason. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |

**Table-level constraints**

- `constraint application_stage_history_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint application_stage_history_stage_changed check (from_stage is null or from_stage <> to_stage)`

### 5.14 `resumes`

Private resume file metadata, extracted text, and parsing lifecycle.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid not null` | Application identifier. |
| `storage_path` | `text not null` | Unique object path in the private `resumes` bucket. |
| `original_filename` | `text not null` | Original filename supplied by the candidate. |
| `mime_type` | `text not null` | Validated document MIME type. |
| `file_size_bytes` | `bigint not null` | Object size in bytes. |
| `checksum_sha256` | `text` | Optional SHA-256 checksum for integrity and deduplication. |
| `extracted_text` | `text` | Text extracted by Apache Tika; highly sensitive. |
| `parsing_status` | `public.parsing_status not null default 'pending'` | Resume extraction/parsing lifecycle. |
| `parsing_error` | `text` | Sanitized parsing error. |
| `uploaded_at` | `timestamptz not null default now()` | Successful object-upload timestamp. |
| `parsed_at` | `timestamptz` | Successful text-parsing timestamp. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint resumes_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint resumes_company_id_id_unique unique (company_id, id)`
- `constraint resumes_application_unique unique (application_id)`
- `constraint resumes_storage_path_unique unique (storage_path)`
- `constraint resumes_filename_not_blank check (btrim(original_filename) <> '')`
- `constraint resumes_mime_type_not_blank check (btrim(mime_type) <> '')`
- `constraint resumes_file_size_positive check (file_size_bytes > 0)`
- `constraint resumes_checksum_format check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9A-Fa-f]{64}$')`
- `constraint resumes_parsing_state check ( (parsing_status = 'completed' and parsed_at is not null and extracted_text is not null) or parsing_status <> 'completed' )`

### 5.15 `candidate_profiles`

Versioned structured resume parsing results used by evaluation workflows.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid not null` | Application identifier. |
| `resume_id` | `uuid not null` | Resume version used to generate this structured profile. |
| `version` | `integer not null` | Application-scoped parser output version. |
| `headline` | `text` | Extracted professional headline. |
| `summary` | `text` | Extracted professional summary. |
| `experience` | `jsonb not null default '[]'::jsonb` | JSON array of structured work history. |
| `education` | `jsonb not null default '[]'::jsonb` | JSON array of structured education. |
| `skills` | `jsonb not null default '[]'::jsonb` | JSON array of skills and evidence. |
| `languages` | `jsonb not null default '[]'::jsonb` | JSON array of languages and proficiency evidence. |
| `certifications` | `jsonb not null default '[]'::jsonb` | JSON array of certifications. |
| `links` | `jsonb not null default '[]'::jsonb` | JSON array of extracted professional links. |
| `total_experience_months` | `integer` | Deterministically or model-extracted total experience in months. |
| `location` | `text` | Extracted location text. |
| `missing_information` | `jsonb not null default '[]'::jsonb` | JSON array of information absent from the resume. |
| `warnings` | `jsonb not null default '[]'::jsonb` | JSON array of parsing warnings. |
| `parser_provider` | `text not null` | Parser/LLM provider, such as Ollama. |
| `parser_model` | `text not null` | Model identifier. |
| `parser_prompt_version` | `text not null` | Version of the parser prompt. |
| `raw_result` | `jsonb` | Validated raw structured model response retained for traceability. |
| `status` | `public.candidate_profile_status not null default 'completed'` | Structured-profile generation outcome. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |

**Table-level constraints**

- `constraint candidate_profiles_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint candidate_profiles_resume_same_company_fk foreign key (company_id, resume_id) references public.resumes(company_id, id) on delete restrict`
- `constraint candidate_profiles_company_id_id_unique unique (company_id, id)`
- `constraint candidate_profiles_application_version_unique unique (application_id, version)`
- `constraint candidate_profiles_version_positive check (version >= 1)`
- `constraint candidate_profiles_total_experience_nonnegative check (total_experience_months is null or total_experience_months >= 0)`
- `constraint candidate_profiles_json_shapes check ( jsonb_typeof(experience) = 'array' and jsonb_typeof(education) = 'array' and jsonb_typeof(skills) = 'array' and jsonb_typeof(languages) = 'array' and jsonb_typeof(certifications) = 'array' and jsonb_typeof(links) = 'array' and jsonb_typeof(missing_information) = 'array' and jsonb_typeof(warnings) = 'array' )`

### 5.16 `ai_evaluations`

Versioned AI-assisted assessment supporting human review; never an automatic hiring decision.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid not null` | Application identifier. |
| `job_id` | `uuid not null` | Job identifier. |
| `candidate_profile_id` | `uuid not null` | Structured profile version evaluated. |
| `model_provider` | `text not null` | Evaluation model provider. |
| `model_name` | `text not null` | Evaluation model identifier. |
| `prompt_version` | `text not null` | Evaluation prompt version. |
| `criteria_version` | `integer not null` | Job criteria version evaluated. |
| `idempotency_key` | `text` | Optional tenant-scoped key preventing duplicate evaluation writes. |
| `total_score` | `numeric(5,2)` | Deterministic weighted score from 0 to 100; not calculated by the language model. |
| `recommendation` | `public.evaluation_recommendation` | Decision-support priority recommendation, not a hiring decision. |
| `summary` | `text` | Human-readable evaluation summary. |
| `strengths` | `jsonb not null default '[]'::jsonb` | JSON array of supported strengths. |
| `gaps` | `jsonb not null default '[]'::jsonb` | JSON array of gaps. |
| `missing_information` | `jsonb not null default '[]'::jsonb` | JSON array of unknown or missing evidence. |
| `interview_questions` | `jsonb not null default '[]'::jsonb` | JSON array of suggested human interview questions. |
| `warnings` | `jsonb not null default '[]'::jsonb` | JSON array of evaluation warnings. |
| `raw_result` | `jsonb` | Validated raw model output. |
| `status` | `public.evaluation_status not null default 'pending'` | Current lifecycle status. |
| `started_at` | `timestamptz` | Evaluation start timestamp. |
| `completed_at` | `timestamptz` | Successful completion timestamp. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |

**Table-level constraints**

- `constraint ai_evaluations_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint ai_evaluations_job_same_company_fk foreign key (company_id, job_id) references public.jobs(company_id, id) on delete restrict`
- `constraint ai_evaluations_profile_same_company_fk foreign key (company_id, candidate_profile_id) references public.candidate_profiles(company_id, id) on delete restrict`
- `constraint ai_evaluations_company_id_id_unique unique (company_id, id)`
- `constraint ai_evaluations_company_idempotency_unique unique (company_id, idempotency_key)`
- `constraint ai_evaluations_total_score_range check (total_score is null or total_score between 0 and 100)`
- `constraint ai_evaluations_criteria_version_positive check (criteria_version >= 1)`
- `constraint ai_evaluations_json_shapes check ( jsonb_typeof(strengths) = 'array' and jsonb_typeof(gaps) = 'array' and jsonb_typeof(missing_information) = 'array' and jsonb_typeof(interview_questions) = 'array' and jsonb_typeof(warnings) = 'array' )`
- `constraint ai_evaluations_completion_state check ( (status = 'completed' and completed_at is not null and total_score is not null and recommendation is not null) or status <> 'completed' )`

### 5.17 `ai_criterion_scores`

Criterion-level status, score, confidence, evidence, and immutable criterion snapshots.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `ai_evaluation_id` | `uuid not null` | Parent evaluation. |
| `job_criterion_id` | `uuid not null` | Evaluated job criterion. |
| `criterion_name_snapshot` | `text not null` | Criterion name captured at evaluation time. |
| `criterion_weight_snapshot` | `numeric(5,2) not null` | Criterion weight captured at evaluation time. |
| `status` | `public.criterion_match_status not null` | Met, partially met, not met, or unknown. |
| `score` | `numeric(5,2) not null` | Criterion score from 0 to 100. |
| `confidence` | `numeric(4,3) not null` | Model confidence from 0 to 1. |
| `evidence` | `jsonb not null default '[]'::jsonb` | JSON array of concise supporting evidence. |
| `explanation` | `text not null` | Human-readable explanation grounded in evidence. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |

**Table-level constraints**

- `constraint ai_criterion_scores_evaluation_same_company_fk foreign key (company_id, ai_evaluation_id) references public.ai_evaluations(company_id, id) on delete cascade`
- `constraint ai_criterion_scores_criterion_same_company_fk foreign key (company_id, job_criterion_id) references public.job_criteria(company_id, id) on delete restrict`
- `constraint ai_criterion_scores_evaluation_criterion_unique unique (ai_evaluation_id, job_criterion_id)`
- `constraint ai_criterion_scores_weight_range check (criterion_weight_snapshot > 0 and criterion_weight_snapshot <= 100)`
- `constraint ai_criterion_scores_score_range check (score between 0 and 100)`
- `constraint ai_criterion_scores_confidence_range check (confidence between 0 and 1)`
- `constraint ai_criterion_scores_evidence_array check (jsonb_typeof(evidence) = 'array')`
- `constraint ai_criterion_scores_explanation_not_blank check (btrim(explanation) <> '')`

### 5.18 `candidate_notes`

Internal recruiter notes attached to an application.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid not null` | Application identifier. |
| `user_id` | `uuid not null references auth.users(id) on delete restrict` | Supabase Auth user identifier. |
| `content` | `text not null` | Internal note content. |
| `is_private` | `boolean not null default true` | Reserved visibility flag; true by default for V0. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint candidate_notes_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint candidate_notes_content_not_blank check (btrim(content) <> '')`

### 5.19 `candidate_messages`

Human-reviewed candidate communication drafts and delivery state.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid not null` | Application identifier. |
| `created_by` | `uuid not null references auth.users(id) on delete restrict` | Auth user who created the record. |
| `channel` | `public.message_channel not null default 'email'` | Delivery channel; email in V0. |
| `recipient` | `citext not null` | Candidate email recipient. |
| `subject` | `text not null` | Message subject. |
| `content` | `text not null` | Human-reviewable message body. |
| `status` | `public.message_status not null default 'draft'` | Current lifecycle status. |
| `provider_message_id` | `text` | External SMTP/provider identifier. |
| `approved_by` | `uuid references auth.users(id) on delete set null` | Auth user who approved the message. |
| `approved_at` | `timestamptz` | Approval timestamp. |
| `sent_at` | `timestamptz` | Successful send timestamp. |
| `error` | `text` | Sanitized send error. |
| `idempotency_key` | `text` | Optional tenant-scoped key preventing duplicate sends. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint candidate_messages_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint candidate_messages_company_idempotency_unique unique (company_id, idempotency_key)`
- `constraint candidate_messages_recipient_not_blank check (btrim(recipient::text) <> '')`
- `constraint candidate_messages_subject_not_blank check (btrim(subject) <> '')`
- `constraint candidate_messages_content_not_blank check (btrim(content) <> '')`
- `constraint candidate_messages_approval_state check ( (status in ('approved', 'queued', 'sent') and approved_by is not null and approved_at is not null) or status not in ('approved', 'queued', 'sent') )`
- `constraint candidate_messages_sent_state check ( (status = 'sent' and sent_at is not null) or status <> 'sent' )`

### 5.20 `activity_logs`

Tenant-scoped audit events with sanitized metadata.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null references public.companies(id) on delete cascade` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `actor_user_id` | `uuid references auth.users(id) on delete set null` | Auth user responsible for the event when actor type is user. |
| `actor_type` | `public.actor_type not null` | User, service, system, or public actor. |
| `entity_type` | `text not null` | Domain entity category. |
| `entity_id` | `uuid` | Optional entity UUID. |
| `action` | `text not null` | Stable event/action name. |
| `metadata` | `jsonb not null default '{}'::jsonb` | Sanitized structured metadata; must not contain secrets or full resume text. |
| `request_id` | `text` | Optional request correlation identifier. |
| `ip_hash` | `text` | Optional non-reversible originating IP hash. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |

**Table-level constraints**

- `constraint activity_logs_entity_type_not_blank check (btrim(entity_type) <> '')`
- `constraint activity_logs_action_not_blank check (btrim(action) <> '')`
- `constraint activity_logs_metadata_object check (jsonb_typeof(metadata) = 'object')`
- `constraint activity_logs_actor_state check ( (actor_type = 'user' and actor_user_id is not null) or actor_type <> 'user' )`

### 5.21 `processing_jobs`

Durable, idempotent asynchronous work queue consumed by n8n/service-role workers.

| Column | SQL definition | Description |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Primary UUID identifier. |
| `company_id` | `uuid not null references public.companies(id) on delete cascade` | Tenant identifier used for isolation, RLS, and same-company foreign keys. |
| `application_id` | `uuid` | Optional associated application. |
| `job_type` | `public.processing_job_type not null` | Workflow type consumed by n8n. |
| `status` | `public.processing_job_status not null default 'pending'` | Current lifecycle status. |
| `priority` | `smallint not null default 0` | Higher values are claimed first. |
| `attempts` | `integer not null default 0` | Number of claims/attempts already made. |
| `max_attempts` | `integer not null default 5` | Maximum allowed attempts. |
| `available_at` | `timestamptz not null default now()` | Earliest time the job may be claimed. |
| `locked_at` | `timestamptz` | Current claim timestamp. |
| `locked_by` | `text` | Worker identifier holding the lock. |
| `lock_expires_at` | `timestamptz` | Lease expiration for recovery. |
| `idempotency_key` | `text not null` | Required tenant-scoped duplicate-prevention key. |
| `payload` | `jsonb not null default '{}'::jsonb` | Structured workflow input. |
| `result` | `jsonb` | Optional structured workflow output. |
| `last_error` | `text` | Latest sanitized processing error. |
| `started_at` | `timestamptz` | First processing start timestamp. |
| `completed_at` | `timestamptz` | Terminal completion/failure timestamp. |
| `created_at` | `timestamptz not null default now()` | UTC timestamp when the row was created. |
| `updated_at` | `timestamptz not null default now()` | UTC timestamp of the most recent row update. |

**Table-level constraints**

- `constraint processing_jobs_application_same_company_fk foreign key (company_id, application_id) references public.applications(company_id, id) on delete cascade`
- `constraint processing_jobs_company_idempotency_unique unique (company_id, idempotency_key)`
- `constraint processing_jobs_attempts_nonnegative check (attempts >= 0)`
- `constraint processing_jobs_max_attempts_positive check (max_attempts > 0)`
- `constraint processing_jobs_attempts_not_excessive check (attempts <= max_attempts)`
- `constraint processing_jobs_payload_object check (jsonb_typeof(payload) = 'object')`
- `constraint processing_jobs_lock_state check ( (status = 'running' and locked_at is not null and locked_by is not null and lock_expires_at is not null) or status <> 'running' )`
- `constraint processing_jobs_completion_state check ( (status = 'completed' and completed_at is not null) or status <> 'completed' )`

## 6. Relationship summary

- `profiles.id` references `auth.users.id` one-to-one.
- `companies` owns branding, members, invitations, jobs, candidates, activity logs, and processing jobs.
- `jobs` owns criteria, questions, and applications.
- `candidates` may submit multiple applications within the same company, but only one per job and normalized email.
- `applications` owns answers, consents, stage history, resume, structured profiles, evaluations, notes, messages, and processing jobs.
- `ai_evaluations` owns criterion scores; each score must reference a criterion from the evaluation job.

## 7. Tenant and role authorization

| Capability | Owner | Admin | Recruiter | Viewer |
|---|:---:|:---:|:---:|:---:|
| Read company, jobs, and candidates | Yes | Yes | Yes | Yes |
| Edit company branding | Yes | Yes | No | No |
| Manage members and invitations | Yes | Yes | No | No |
| Create/edit jobs, criteria, and questions | Yes | Yes | Yes | No |
| Change application pipeline | Yes | Yes | Yes | No |
| Create notes and message drafts | Yes | Yes | Yes | No |
| Read AI results and resumes | Yes | Yes | Yes | Yes |
| Write parser/evaluation results | Service role | Service role | Service role | Service role |

RLS helper functions are located in the non-exposed `private` schema. They use fixed `search_path` values and active membership checks. The final active owner cannot be removed or demoted.

## 8. Public and management RPCs

| Function | Intended caller | Purpose |
|---|---|---|
| `create_company` | Authenticated user | Atomically creates a company, branding record, owner membership, and audit entry. |
| `publish_job` | Owner, admin, or recruiter | Publishes a job only after validating 4–8 active criteria, a 100% weight total, and required-criterion policy. |
| `get_public_career_site` | Anonymous or authenticated | Returns only public company branding for a published careers site. |
| `list_public_jobs` | Anonymous or authenticated | Returns currently published, non-expired jobs with optional filters. |
| `get_public_job` | Anonymous or authenticated | Returns one public job and its active application questions as JSON. |
| `submit_public_application` | Service role through an Edge Function | Atomically upserts the tenant candidate, creates the application, answers, consents, resume metadata, jobs, and audit event. |
| `claim_processing_jobs` | Service role / n8n | Claims available jobs atomically with `FOR UPDATE SKIP LOCKED` and a lease. |
| `complete_processing_job` | Service role / n8n | Completes a job owned by the current worker. |
| `fail_processing_job` | Service role / n8n | Retries or terminally fails a job based on the attempt limit. |
| `release_expired_processing_job_locks` | Service role / recovery workflow | Requeues or fails jobs whose worker lease expired. |

## 9. Storage

| Bucket | Visibility | Limit | Allowed content | Path convention |
|---|---|---:|---|---|
| `company-assets` | Public read; manager writes | 5 MiB | PNG, JPEG, WebP, SVG | `{company_id}/branding/{uuid}.{extension}` |
| `resumes` | Private; member read; recruiter/manager writes | 15 MiB | PDF, DOCX, ODT, RTF, TXT | `{company_id}/{job_id}/{application_id}/{uuid}.{extension}` |

Public candidate uploads should use a short-lived signed upload URL created by a trusted Supabase Edge Function. The browser must never receive a service-role key.

## 10. Important integrity rules

- A company must retain at least one active owner.
- A job cannot remain `published` unless it has 4–8 active criteria whose weights sum to exactly 100.
- Published criteria cannot be changed into an invalid state; pause the job before restructuring criteria.
- An answer must reference a question belonging to the same job as its application.
- A candidate profile must reference a resume belonging to the same application.
- An AI evaluation must use the application job and a candidate profile from the same application.
- An AI criterion score must reference a criterion from the evaluation job.
- Duplicate public applications are prevented by `(company_id, job_id, applicant_email_normalized)`.
- Queue jobs, messages, and AI evaluations use tenant-scoped idempotency keys where applicable.

## 11. Operational notes

1. Run the SQL as a Supabase database owner through the migration runner or SQL editor.
2. Use `create_company()` for onboarding instead of direct inserts into company tables.
3. Use `publish_job()` for publication; database triggers independently enforce the same publication invariant.
4. Keep anonymous access limited to the public RPCs.
5. Invoke `submit_public_application()` only from a protected Edge Function after anti-abuse validation and resume upload authorization.
6. Configure n8n with a server-side Supabase service-role credential and never expose it to the frontend.
7. Do not write full resume text, secrets, tokens, or unnecessary personal data to `activity_logs.metadata` or n8n execution logs.
8. The migration intentionally does not create demo tenant rows because every company must have a valid `auth.users` owner.

## 12. Index strategy

The schema includes indexes for active membership lookups, public job discovery, job pipelines, candidate history, latest parser/evaluation versions, audit timelines, message status, pending queue claims, and expired worker locks. GIN indexes on JSON resume fields are intentionally deferred until real query patterns justify them.

## 13. Deletion behavior

- Deleting an Auth user cascades its profile and membership rows but is restricted where the user created protected business records.
- Deleting a company cascades tenant-owned data and Storage metadata is handled separately through the Storage API.
- Jobs and candidates referenced by applications use restrictive deletion behavior to preserve recruiting history.
- Application-owned answers, consents, stage history, resumes, profiles, evaluations, notes, messages, and queue jobs cascade with the application.
- Historical criterion/evaluation references use restrictive deletion where preserving explainability is required.
