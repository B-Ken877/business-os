# API Contract — `retail-barcode-scanning`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `registerBarcode`

**Permission required:** `retail.barcodes.register`

**Description:** Register a barcode against a product. A barcode can be registered to at most one product per tenant.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` | yes |  |
| `format` | `string` | yes |  |
| `productId` | `string` | yes |  |

**Returns:** `Result<Barcode>`

**Audit:** emits an entry with action `retail.barcode.registered`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `lookupBarcode`

**Permission required:** `retail.barcodes.lookup`

**Description:** Resolve a scanned barcode string to a product. Returns NOT_FOUND if the barcode is not registered.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` | yes |  |

**Returns:** `Result<Barcode>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
