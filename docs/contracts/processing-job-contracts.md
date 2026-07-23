# Processing job contracts

Every job payload is validated before insertion and again by the worker. JSON Schema is provided in `schemas/processing-job.schema.json`.

## Common fields

```json
{
  "jobId": "uuid",
  "companyId": "uuid",
  "applicationId": "uuid-or-null",
  "type": "resume_parse",
  "idempotencyKey": "stable-string",
  "payload": {}
}
```

## `resume_parse`

```json
{
  "resumeId": "uuid",
  "requestedProfileVersion": 1,
  "promptVersion": "resume-parser-v1"
}
```

Idempotency key example: `resume_parse:{resumeId}:{checksum}:{promptVersion}`.

## `candidate_evaluation`

```json
{
  "jobId": "uuid",
  "candidateProfileId": "uuid",
  "criteriaVersion": "sha256-or-version",
  "promptVersion": "candidate-evaluator-v1"
}
```

Idempotency key example: `candidate_evaluation:{applicationId}:{candidateProfileId}:{criteriaVersion}:{promptVersion}:{model}`.

## `follow_up_draft`

```json
{
  "messageId": "uuid",
  "purpose": "interview_invitation",
  "language": "es",
  "recruiterInstructions": "..."
}
```

Creates/updates only the designated draft record while preserving approval state rules.

## `send_email`

```json
{
  "messageId": "uuid"
}
```

The worker must re-read recipient, content, status, approval, and idempotency key from canonical state. Do not trust copied payload content for sending.

## `application_confirmation`

```json
{
  "messageId": "uuid"
}
```

May be queued automatically after a valid application according to product configuration, but content must be template-controlled and must not include AI evaluation.

## Retry classification

Retryable: connection timeout, temporary 5xx, unavailable model, transient SMTP failure, lost worker lock before side effect.

Non-retryable without human/input change: invalid payload, unsupported document, missing storage object, authorization mismatch, invalid schema after max model repair attempt, cancelled message, duplicate business conflict.
