# API Contract — `school-class-scheduling`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `scheduleSession`

**Permission required:** `school.scheduling.manage`

**Description:** Schedule a class session. Detects teacher and room conflicts.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `subject` | `string` | yes |  |
| `teacherUserId` | `string` | yes |  |
| `roomId` | `string` | yes |  |
| `dayOfWeek` | `number` | yes |  |
| `startHour` | `number` | yes |  |
| `startMinute` | `number` | yes |  |

**Returns:** `Result<ClassSession>`

**Audit:** emits an entry with action `school.session.scheduled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listSessionsForTeacher`

**Permission required:** `school.scheduling.read`

**Description:** List all sessions assigned to a teacher.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `teacherUserId` | `string` | yes |  |

**Returns:** `Result<readonly ClassSession[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
