# API Contract — `search-and-filter`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `runQuery`

**Permission required:** `search.query`

**Description:** Run a search/filter/sort/paginate query against a list of items supplied by the caller.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `entityType` | `string` | yes |  |
| `queryText` | `string` | no |  |
| `pageSize` | `number` | yes |  |
| `cursor` | `string` | no |  |
| `sortField` | `string` | no |  |
| `sortDirection` | `string` | yes |  |

**Returns:** `Result<{ items: ReadonlyArray<Record<string, unknown>>; nextCursor: string | null }>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `saveQuery`

**Permission required:** `search.query`

**Description:** Persist a query for later re-use by the same user.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `entityType` | `string` | yes |  |
| `queryText` | `string` | no |  |
| `sortField` | `string` | no |  |
| `sortDirection` | `string` | yes |  |

**Returns:** `Result<SavedQuery>`

**Audit:** emits an entry with action `search.query.saved`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
