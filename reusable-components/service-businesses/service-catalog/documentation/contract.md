# API Contract — `service-catalog`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createService`

**Permission required:** `service.catalog.manage`

**Description:** Create a new service.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `categoryId` | `string` | yes |  |
| `priceCents` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `durationMinutes` | `number` | yes |  |
| `description` | `string` | no |  |

**Returns:** `Result<Service>`

**Audit:** emits an entry with action `service.catalog.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listActiveServices`

**Permission required:** `service.catalog.read`

**Description:** List all active services.

**Input:** none.

**Returns:** `Result<readonly Service[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
