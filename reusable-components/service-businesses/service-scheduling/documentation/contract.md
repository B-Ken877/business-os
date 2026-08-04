# API Contract — `service-scheduling`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `setWorkingHours`

**Permission required:** `service.scheduling.manage`

**Description:** Set a staff member's working hours for a day.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `staffUserId` | `string` | yes |  |
| `dayOfWeek` | `number` | yes |  |
| `startHour` | `number` | yes |  |
| `endHour` | `number` | yes |  |

**Returns:** `Result<StaffAvailability>`

**Audit:** emits an entry with action `service.scheduling.hours_set`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `isAvailable`

**Permission required:** `service.scheduling.read`

**Description:** Check if a staff member is available at a given time (within working hours and not on time off).

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `staffUserId` | `string` | yes |  |
| `at` | `string` | yes |  |

**Returns:** `Result<boolean>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
