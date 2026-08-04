# API Contract — `service-booking`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createBooking`

**Permission required:** `service.bookings.create`

**Description:** Create a new booking. Detects staff scheduling conflicts.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerId` | `string` | yes |  |
| `serviceId` | `string` | yes |  |
| `staffUserId` | `string` | yes |  |
| `scheduledAt` | `string` | yes |  |
| `durationMinutes` | `number` | yes |  |

**Returns:** `Result<Booking>`

**Audit:** emits an entry with action `service.booking.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markCompleted`

**Permission required:** `service.bookings.update_status`

**Description:** Mark a booking as completed.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `bookingId` | `string` | yes |  |

**Returns:** `Result<Booking>`

**Audit:** emits an entry with action `service.booking.completed`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markNoShow`

**Permission required:** `service.bookings.update_status`

**Description:** Mark a booking as a no-show.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `bookingId` | `string` | yes |  |

**Returns:** `Result<Booking>`

**Audit:** emits an entry with action `service.booking.no_show`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
