# API Contract — `restaurant-order-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createOrder`

**Permission required:** `restaurant.orders.create`

**Description:** Place a new order.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `itemsJson` | `string` | yes |  |
| `fulfillmentType` | `string` | yes |  |
| `tableId` | `string` | no |  |
| `deliveryAddress` | `string` | no |  |
| `specialInstructions` | `string` | no |  |

**Returns:** `Result<Order>`

**Audit:** emits an entry with action `restaurant.order.placed`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `advanceOrderStatus`

**Permission required:** `restaurant.orders.update_status`

**Description:** Advance the order to the next status. Enforces the state machine.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `orderId` | `string` | yes |  |

**Returns:** `Result<Order>`

**Audit:** emits an entry with action `restaurant.order.status_advanced`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `cancelOrder`

**Permission required:** `restaurant.orders.cancel`

**Description:** Cancel an order. Only allowed before it's served.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `orderId` | `string` | yes |  |

**Returns:** `Result<Order>`

**Audit:** emits an entry with action `restaurant.order.cancelled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
