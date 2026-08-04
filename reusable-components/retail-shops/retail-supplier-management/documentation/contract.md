# API Contract — `retail-supplier-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createSupplier`

**Permission required:** `retail.suppliers.manage`

**Description:** Create a new supplier record.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `contactName` | `string` | no |  |
| `phone` | `string` | no |  |
| `email` | `string` | no |  |
| `address` | `string` | no |  |
| `paymentTermsDays` | `number` | yes |  |

**Returns:** `Result<Supplier>`

**Audit:** emits an entry with action `retail.supplier.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `createPurchaseOrder`

**Permission required:** `retail.purchaseorders.create`

**Description:** Create a new purchase order for a supplier.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `supplierId` | `string` | yes |  |
| `itemsJson` | `string` | yes |  |
| `totalCents` | `number` | yes |  |
| `currency` | `string` | yes |  |

**Returns:** `Result<PurchaseOrder>`

**Audit:** emits an entry with action `retail.po.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markPurchaseOrderReceived`

**Permission required:** `retail.purchaseorders.receive`

**Description:** Mark a PO as received. The actual stock increment is delegated to retail-inventory.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `purchaseOrderId` | `string` | yes |  |

**Returns:** `Result<PurchaseOrder>`

**Audit:** emits an entry with action `retail.po.received`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
