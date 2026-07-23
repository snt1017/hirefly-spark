# 08 — Asynchronous workflows and AI

## Durable job model

`processing_jobs` is the durable source for asynchronous state. A job has type, status, priority, attempts, availability, lock fields, idempotency key, payload, sanitized result, error, and timestamps.

Suggested states:

`pending`, `processing`, `completed`, `failed`, `cancelled`.

A worker claims work atomically. Recovery returns expired processing locks to pending or failed according to attempts.

## Workflow: resume processing

Input: processing job ID, company ID, application ID, resume ID.

Steps:

1. Claim job.
2. Fetch application/resume metadata.
3. Generate a short-lived signed URL.
4. Download with byte/time limits.
5. Send document to internal Tika.
6. Validate extracted text length and quality.
7. Normalize text without changing meaning.
8. Call Ollama with the resume parser prompt and JSON Schema.
9. Validate JSON.
10. Insert a new `candidate_profiles` version.
11. Create an idempotent `candidate_evaluation` job.
12. Mark complete and add an activity event.

Failure classes: missing object, unsupported type, no extractable text, extraction timeout, model timeout, invalid model JSON, database error. Scanned/no-text documents become `needs_review` rather than silently failing.

## Workflow: candidate evaluation

Input: application, job, criteria version, candidate profile version.

Steps:

1. Claim job.
2. Load explicit job criteria and application answers.
3. Build a minimal evaluation payload; omit unnecessary personal attributes.
4. Call Ollama with evaluator prompt and schema.
5. Validate criterion IDs and score/confidence ranges.
6. Ensure every active criterion has exactly one result.
7. Calculate deterministic weighted score in code or SQL.
8. Insert evaluation and criterion-score rows transactionally.
9. Mark complete and add activity.

Weighted score:

```text
total = sum(criterion_score * criterion_weight) / 100
```

Unknown criteria still receive the model-provided numeric score only if the agreed rubric permits it; the orchestration layer must apply one documented rule consistently. The recommended V0 rule is `unknown = 0` for the numeric support score while clearly labeling insufficient evidence and avoiding automatic decisions.

## Workflow: follow-up draft

Input: public company name, job title, candidate preferred name, current stage, communication purpose, recruiter instructions, allowed scheduling details, language.

Output: subject, body, missing information, warnings. Persist as `draft`; never send automatically.

## Workflow: send email

1. Claim `send_email` job.
2. Re-read the message and verify `approved` state.
3. Verify recipient and idempotency key.
4. Send through SMTP.
5. Store provider ID and `sent_at`.
6. On retry, check whether already sent before any second send.
7. Record sanitized activity.

## Recovery workflow

Runs on a schedule and:

- releases expired locks,
- retries eligible transient failures with bounded backoff,
- marks exhausted jobs failed,
- creates no duplicate side effects,
- emits operational alerts for repeated failures.

## AI adapter

Expose a provider-neutral interface such as:

```ts
interface StructuredModelClient {
  generate<T>(input: {
    task: 'resume_parse' | 'candidate_evaluation' | 'follow_up';
    systemPrompt: string;
    payload: unknown;
    jsonSchema: object;
    model: string;
    timeoutMs: number;
  }): Promise<{ data: T; raw: unknown; model: string }>;
}
```

The adapter owns transport details, timeout, response extraction, and schema validation. Business code owns domain validation and scoring.
