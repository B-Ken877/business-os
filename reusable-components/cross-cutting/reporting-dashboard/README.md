# Reporting Dashboard

> Configurable dashboards, summaries, and exportable reports.

**Component ID:** `reporting-dashboard`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Give every business a single API to define, compute, and surface operational metrics (sales today, low-stock count, absent students this week) without each component building its own reporting layer.

## Business problem solved

Today, Haitian businesses rely on paper notebooks and mental arithmetic to answer questions like 'how much did I sell today?' or 'which products need restocking?'. This component standardises how metrics are defined, computed, and surfaced so a future dashboard UI has a stable data source to render.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Define a metric (name, source query, refresh interval, owner)
- Compute a metric on demand for a time window
- Schedule periodic refresh (the schedule is declared; the runner is a separate concern)
- Export a metric's series as CSV/JSON
- Compose multiple metrics into a named dashboard
- Per-tenant metric isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxMetricsPerTenant` (`number`, default `50`) — Hard cap on the number of metrics a tenant can define.
- `defaultRefreshIntervalSeconds` (`number`, default `300`) — Default refresh interval (5 minutes).
- `maxQueryWindowDays` (`number`, default `365`) — Maximum days a single query can span.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `reporting.metrics.define`
- `reporting.metrics.read`
- `reporting.metrics.delete`
- `reporting.dashboards.manage`

## Data handled

Metric definitions (query text, parameters), computed metric values, dashboard layouts. Metric values may aggregate sensitive underlying data (revenue, patient counts) but only expose the aggregate.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- The query runner is external — this component only stores definitions and recorded values.
- No real-time streaming — values are point-in-time snapshots.
- No chart rendering — a future UI component will visualise the series.

## Future improvements

- Dashboard composition (group multiple metrics into a named layout).
- Scheduled export (email a CSV every Monday).
- Anomaly detection on recorded values.

---

## Folder layout

```
reporting-dashboard/
├── README.md                  (this file)
├── component.json             (machine-readable manifest)
├── documentation/
│   ├── contract.md            (API contract)
│   └── configuration.md       (config reference)
├── backend/
│   ├── types.ts               (domain types — the canonical contract)
│   ├── validation.ts          (input validation helpers)
│   ├── logic.ts               (operations + permission/audit enforcement)
│   └── index.ts               (public barrel)
├── database/
│   └── schema.ts              (data model — types only, no DB adapter yet)
├── api/
│   └── contract.ts            (HTTP-shaped contract — types only)
├── config/
│   ├── schema.ts              (config schema)
│   └── defaults.ts            (default values)
├── tests/
│   ├── logic.test.ts          (happy path + business rules)
│   ├── validation.test.ts     (input validation)
│   └── tenant-isolation.test.ts (cross-tenant access denial)
└── examples/
    └── basic-usage.ts
```
