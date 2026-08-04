# API Contract — `reporting-dashboard`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `defineMetric`

**Permission required:** `reporting.metrics.define`

**Description:** Define a new metric for the tenant.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | `string` | yes |  |
| `name` | `string` | yes |  |
| `sourceQuery` | `string` | yes |  |
| `refreshIntervalSeconds` | `number` | yes |  |

**Returns:** `Result<Metric>`

**Audit:** emits an entry with action `reporting.metric.defined`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `recordMetricValue`

**Permission required:** `reporting.metrics.read`

**Description:** Record a computed value for a metric. Called by the platform's query runner after it computes the value.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `metricKey` | `string` | yes |  |
| `windowStart` | `string` | yes |  |
| `windowEnd` | `string` | yes |  |
| `value` | `number` | yes |  |

**Returns:** `Result<MetricValue>`

**Audit:** emits an entry with action `reporting.metric.value_recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `getMetricSeries`

**Permission required:** `reporting.metrics.read`

**Description:** Fetch all recorded values for a metric in a given window.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `metricKey` | `string` | yes |  |
| `windowStart` | `string` | yes |  |
| `windowEnd` | `string` | yes |  |

**Returns:** `Result<readonly MetricValue[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
