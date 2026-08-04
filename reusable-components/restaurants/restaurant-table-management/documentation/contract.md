# API Contract — `restaurant-table-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createTable`

**Permission required:** `restaurant.tables.manage`

**Description:** Define a new table.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `label` | `string` | yes |  |
| `seats` | `number` | yes |  |

**Returns:** `Result<Table>`

**Audit:** emits an entry with action `restaurant.table.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `assignOrderToTable`

**Permission required:** `restaurant.tables.assign`

**Description:** Assign an order to a free table, marking the table as seated.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `tableId` | `string` | yes |  |
| `orderId` | `string` | yes |  |

**Returns:** `Result<Table>`

**Audit:** emits an entry with action `restaurant.table.assigned`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `releaseTable`

**Permission required:** `restaurant.tables.assign`

**Description:** Release a table after the order is served. Marks the table as dirty for cleaning.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `tableId` | `string` | yes |  |

**Returns:** `Result<Table>`

**Audit:** emits an entry with action `restaurant.table.released`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
