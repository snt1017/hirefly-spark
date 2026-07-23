# Event and audit contracts

## Event shape

```json
{
  "action": "application.stage_changed",
  "entityType": "application",
  "entityId": "uuid",
  "actorType": "user",
  "actorUserId": "uuid-or-null",
  "requestId": "uuid-or-null",
  "metadata": {}
}
```

## Allow-listed actions and metadata

| Action | Allowed metadata |
|---|---|
| `company.created` | public slug |
| `company.branding_updated` | changed field names, not full values where sensitive |
| `job.published` | job ID, previous status |
| `application.received` | job ID, source |
| `resume.uploaded` | resume ID, MIME, size |
| `resume.parsing_completed` | profile ID/version, duration |
| `resume.parsing_failed` | error class, attempt count |
| `evaluation.completed` | evaluation ID, model, prompt/criteria versions |
| `application.stage_changed` | from stage, to stage, reason presence |
| `candidate_note.created` | note ID only |
| `candidate_message.approved` | message ID |
| `candidate_message.sent` | message ID, provider ID if safe |

Never store full note content, email body, resume text, model prompt, raw model output, tokens, passwords, or signed URLs in activity metadata.

## Webhook activation envelope

```json
{
  "eventId": "uuid",
  "eventType": "processing_job.created",
  "timestamp": "2026-07-21T12:00:00Z",
  "processingJobId": "uuid"
}
```

Sign the exact body with HMAC and send timestamp. n8n rejects stale timestamps and duplicate event IDs. Webhook delivery is an accelerator; scheduled job recovery remains the correctness mechanism.
