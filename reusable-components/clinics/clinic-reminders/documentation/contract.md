# API Contract — `clinic-reminders`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `scheduleReminder`

**Permission required:** `clinic.reminders.schedule`

**Description:** Schedule a reminder for a patient.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `reminderType` | `string` | yes |  |
| `scheduledFor` | `string` | yes |  |
| `payloadJson` | `string` | yes |  |

**Returns:** `Result<Reminder>`

**Audit:** emits an entry with action `clinic.reminder.scheduled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `cancelReminder`

**Permission required:** `clinic.reminders.cancel`

**Description:** Cancel a scheduled reminder.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `reminderId` | `string` | yes |  |

**Returns:** `Result<Reminder>`

**Audit:** emits an entry with action `clinic.reminder.cancelled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
