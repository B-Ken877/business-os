# API Contract — `school-student-enrollment`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `enrollStudent`

**Permission required:** `school.students.create`

**Description:** Enroll a new student.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | `string` | yes |  |
| `lastName` | `string` | yes |  |
| `dateOfBirth` | `string` | yes |  |
| `guardianName` | `string` | yes |  |
| `guardianPhone` | `string` | no |  |

**Returns:** `Result<Student>`

**Audit:** emits an entry with action `school.student.enrolled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `updateEnrollmentStatus`

**Permission required:** `school.students.update`

**Description:** Update a student's enrollment status.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |
| `newStatus` | `string` | yes |  |

**Returns:** `Result<Student>`

**Audit:** emits an entry with action `school.student.status_updated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
