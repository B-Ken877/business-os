# API Contract — `restaurant-shift-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createShift`

**Permission required:** `restaurant.shifts.manage`

**Description:** Schedule a new shift.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `staffUserId` | `string` | yes |  |
| `startsAt` | `string` | yes |  |
| `endsAt` | `string` | yes |  |
| `role` | `string` | yes |  |

**Returns:** `Result<Shift>`

**Audit:** emits an entry with action `restaurant.shift.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `addHandoffNotes`

**Permission required:** `restaurant.shifts.manage`

**Description:** Append handoff notes to a shift, for the next shift to read.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `shiftId` | `string` | yes |  |
| `notes` | `string` | yes |  |

**Returns:** `Result<Shift>`

**Audit:** emits an entry with action `restaurant.shift.handoff_added`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
