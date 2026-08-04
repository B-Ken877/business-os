# API Contract — `school-exams`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createExam`

**Permission required:** `school.exams.manage`

**Description:** Create a new exam period.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `period` | `string` | yes |  |
| `startsAt` | `string` | yes |  |
| `endsAt` | `string` | yes |  |

**Returns:** `Result<Exam>`

**Audit:** emits an entry with action `school.exam.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markExamGraded`

**Permission required:** `school.exams.manage`

**Description:** Mark an exam as fully graded.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `examId` | `string` | yes |  |

**Returns:** `Result<Exam>`

**Audit:** emits an entry with action `school.exam.graded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
