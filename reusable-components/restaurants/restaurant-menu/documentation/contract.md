# API Contract — `restaurant-menu`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createMenuItem`

**Permission required:** `restaurant.menu.items.manage`

**Description:** Create a new menu item.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `categoryId` | `string` | yes |  |
| `priceCents` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `description` | `string` | no |  |

**Returns:** `Result<MenuItem>`

**Audit:** emits an entry with action `restaurant.menu.item_created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `setAvailability`

**Permission required:** `restaurant.menu.availability.manage`

**Description:** Mark a menu item as available or 86'd.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `itemId` | `string` | yes |  |
| `available` | `boolean` | yes |  |

**Returns:** `Result<MenuItem>`

**Audit:** emits an entry with action `restaurant.menu.availability_changed`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
