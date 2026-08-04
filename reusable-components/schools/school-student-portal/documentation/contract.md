# API Contract — `school-student-portal`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `startSession`

**Permission required:** `school.portal.student.view`

**Description:** Start a portal session for a student. The studentId is taken from the calling context's user identity, NOT from the request body.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |

**Returns:** `Result<StudentPortalSession>`

**Audit:** emits an entry with action `school.portal.session_started`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `endSession`

**Permission required:** `school.portal.student.view`

**Description:** End a portal session.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | yes |  |

**Returns:** `Result<StudentPortalSession>`

**Audit:** emits an entry with action `school.portal.session_ended`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
