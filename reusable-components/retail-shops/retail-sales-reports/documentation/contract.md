# API Contract — `retail-sales-reports`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `computeDailySummary`

**Permission required:** `retail.reports.read`

**Description:** Compute the daily sales summary for a given date, based on the sales recorded by the POS.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `date` | `string` | yes |  |

**Returns:** `Result<DailySalesSummary>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
