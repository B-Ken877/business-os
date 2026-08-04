# API Contract — `school-parent-communication`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `sendParentMessage`

**Permission required:** `school.parent_comm.send`

**Description:** Send a message to a student's parent.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |
| `subject` | `string` | yes |  |
| `body` | `string` | yes |  |

**Returns:** `Result<ParentMessage>`

**Audit:** emits an entry with action `school.parent_message.sent`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listMessagesForStudent`

**Permission required:** `school.parent_comm.read`

**Description:** List all messages for a student's parent, newest first.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |

**Returns:** `Result<readonly ParentMessage[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
