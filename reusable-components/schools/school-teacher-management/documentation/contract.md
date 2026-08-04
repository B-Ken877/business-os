# API Contract — `school-teacher-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createTeacher`

**Permission required:** `school.teachers.manage`

**Description:** Create a new teacher record.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | `string` | yes |  |
| `lastName` | `string` | yes |  |
| `email` | `string` | no |  |
| `phone` | `string` | no |  |
| `subjectsJson` | `string` | no |  |

**Returns:** `Result<Teacher>`

**Audit:** emits an entry with action `school.teacher.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listTeachers`

**Permission required:** `school.teachers.read`

**Description:** List all teachers.

**Input:** none.

**Returns:** `Result<readonly Teacher[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
