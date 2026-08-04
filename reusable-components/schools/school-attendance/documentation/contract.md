# API Contract — `school-attendance`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `recordAttendance`

**Permission required:** `school.attendance.record`

**Description:** Record a student's attendance for a session. Idempotent on (studentId, sessionDate).

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |
| `sessionDate` | `string` | yes |  |
| `status` | `string` | yes |  |
| `notes` | `string` | no |  |

**Returns:** `Result<AttendanceRecord>`

**Audit:** emits an entry with action `school.attendance.recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `computeAttendanceRate`

**Permission required:** `school.attendance.read`

**Description:** Compute a student's attendance rate over a date range. Returns absent percentage.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |
| `fromDate` | `string` | yes |  |
| `toDate` | `string` | yes |  |

**Returns:** `Result<{ totalSessions: number; absentSessions: number; absentPct: number; isChronic: boolean }>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
