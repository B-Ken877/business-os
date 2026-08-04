# API Contract — `church-attendance`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `recordAttendance`

**Permission required:** `church.attendance.record`

**Description:** Record a member's attendance for a service. Idempotent on (memberId, serviceDate).

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `memberId` | `string` | yes |  |
| `serviceDate` | `string` | yes |  |
| `attended` | `boolean` | yes |  |

**Returns:** `Result<ServiceAttendance>`

**Audit:** emits an entry with action `church.attendance.recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `isDeclining`

**Permission required:** `church.attendance.read`

**Description:** Check if a member has missed the last N consecutive services.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `memberId` | `string` | yes |  |
| `asOfDate` | `string` | yes |  |

**Returns:** `Result<{ declining: boolean; consecutiveAbsences: number }>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
