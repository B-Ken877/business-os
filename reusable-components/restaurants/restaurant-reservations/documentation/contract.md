# API Contract — `restaurant-reservations`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createReservation`

**Permission required:** `restaurant.reservations.create`

**Description:** Create a new reservation.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerName` | `string` | yes |  |
| `customerPhone` | `string` | no |  |
| `partySize` | `number` | yes |  |
| `scheduledAt` | `string` | yes |  |

**Returns:** `Result<Reservation>`

**Audit:** emits an entry with action `restaurant.reservation.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `cancelReservation`

**Permission required:** `restaurant.reservations.cancel`

**Description:** Cancel a reservation.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `reservationId` | `string` | yes |  |

**Returns:** `Result<Reservation>`

**Audit:** emits an entry with action `restaurant.reservation.cancelled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
