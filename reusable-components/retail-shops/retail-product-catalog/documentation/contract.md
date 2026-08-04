# API Contract — `retail-product-catalog`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createProduct`

**Permission required:** `retail.products.create`

**Description:** Create a new product.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `sku` | `string` | yes |  |
| `categoryId` | `string` | yes |  |
| `priceCents` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `description` | `string` | no |  |

**Returns:** `Result<Product>`

**Audit:** emits an entry with action `retail.product.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `updatePrice`

**Permission required:** `retail.products.update`

**Description:** Update a product's price. Records the previous price in audit.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `productId` | `string` | yes |  |
| `newPriceCents` | `number` | yes |  |

**Returns:** `Result<Product>`

**Audit:** emits an entry with action `retail.product.price_updated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `archiveProduct`

**Permission required:** `retail.products.archive`

**Description:** Archive a product so it no longer appears in the active catalog.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `productId` | `string` | yes |  |

**Returns:** `Result<Product>`

**Audit:** emits an entry with action `retail.product.archived`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
