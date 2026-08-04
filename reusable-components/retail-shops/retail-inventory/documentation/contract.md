# API Contract — `retail-inventory`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `adjustStock`

**Permission required:** `retail.inventory.adjust`

**Description:** Adjust stock by a delta (positive or negative). Records a movement.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `productId` | `string` | yes |  |
| `delta` | `number` | yes | Change in quantity. Positive for restock, negative for out. |
| `reason` | `string` | yes |  |
| `reference` | `string` | no |  |

**Returns:** `Result<StockLevel>`

**Audit:** emits an entry with action `retail.stock.adjusted`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `setLowStockThreshold`

**Permission required:** `retail.inventory.thresholds.manage`

**Description:** Set the low-stock threshold for a product.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `productId` | `string` | yes |  |
| `threshold` | `number` | yes |  |

**Returns:** `Result<StockLevel>`

**Audit:** emits an entry with action `retail.threshold.updated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listMovementsForProduct`

**Permission required:** `retail.inventory.read`

**Description:** List all stock movements for a product, newest first.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `productId` | `string` | yes |  |

**Returns:** `Result<readonly StockMovement[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
