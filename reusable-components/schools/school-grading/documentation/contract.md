# API Contract — `school-grading`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `recordGrade`

**Permission required:** `school.grades.record`

**Description:** Record a student's grade for an assessment. Idempotent on (studentId, assessmentId).

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |
| `assessmentId` | `string` | yes |  |
| `scorePct` | `number` | yes |  |
| `notes` | `string` | no |  |

**Returns:** `Result<Grade>`

**Audit:** emits an entry with action `school.grade.recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `computeStudentAverage`

**Permission required:** `school.grades.read`

**Description:** Compute a student's overall average across all assessments.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |

**Returns:** `Result<{ averagePct: number; isPassing: boolean; assessmentCount: number }>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
