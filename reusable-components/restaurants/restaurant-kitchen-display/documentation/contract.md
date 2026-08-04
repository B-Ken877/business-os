# API Contract — `restaurant-kitchen-display`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createTicket`

**Permission required:** `restaurant.kitchen.tickets.update`

**Description:** Create a kitchen ticket from an order.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `orderId` | `string` | yes |  |
| `itemsJson` | `string` | yes |  |
| `station` | `string` | yes |  |
| `priority` | `number` | yes |  |

**Returns:** `Result<KitchenTicket>`

**Audit:** emits an entry with action `restaurant.kitchen.ticket_created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markTicketReady`

**Permission required:** `restaurant.kitchen.tickets.update`

**Description:** Mark a kitchen ticket as ready for pickup.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `ticketId` | `string` | yes |  |

**Returns:** `Result<KitchenTicket>`

**Audit:** emits an entry with action `restaurant.kitchen.ticket_ready`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listTicketsForStation`

**Permission required:** `restaurant.kitchen.tickets.read`

**Description:** List open tickets for a station, sorted by priority then placement time.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `station` | `string` | yes |  |

**Returns:** `Result<readonly KitchenTicket[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
