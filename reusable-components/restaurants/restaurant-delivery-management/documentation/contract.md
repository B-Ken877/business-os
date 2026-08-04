# API Contract — `restaurant-delivery-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `assignDriver`

**Permission required:** `restaurant.delivery.assign`

**Description:** Assign a driver to a delivery.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `deliveryId` | `string` | yes |  |
| `driverId` | `string` | yes |  |

**Returns:** `Result<Delivery>`

**Audit:** emits an entry with action `restaurant.delivery.driver_assigned`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `confirmDelivered`

**Permission required:** `restaurant.delivery.update`

**Description:** Confirm a delivery was completed.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `deliveryId` | `string` | yes |  |

**Returns:** `Result<Delivery>`

**Audit:** emits an entry with action `restaurant.delivery.delivered`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
