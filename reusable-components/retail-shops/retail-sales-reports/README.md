# Retail Sales Reports

> Daily sales summaries, product performance, profit reporting, and exports.

**Component ID:** `retail-sales-reports`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Aggregate raw sale records (from the POS) into the reports a shop owner actually needs: 'how much did I sell today?', 'which products are my top sellers?', 'what's my gross margin this week?'.

## Business problem solved

Sale records alone are too granular for decision-making. Shop owners need summaries — daily totals, top products, profit trends — and they need them exportable (CSV) so they can share with an accountant.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Daily sales total (revenue, count, average basket)
- Top products by revenue and by quantity
- Profit estimate (revenue minus cost, where cost is known)
- CSV export of any report
- Per-tenant isolation

## Dependencies

- `@business-os/shared`
- `retail-point-of-sale`
- `reporting-dashboard`

## Configuration options

- `topN` (`number`, default `10`) — Default N for top-products reports.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.reports.read`

## Data handled

Aggregated sales figures, product performance. Aggregates are less sensitive than raw sales but still commercially valuable.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- Profit reporting requires cost data which is not yet tracked by the catalog — profit reports will be added when product cost is added.
- No multi-currency aggregation.
- No scheduled reports — every report is computed on demand.

## Future improvements

- Profit reports (once product cost is tracked).
- Top-products report.
- Scheduled CSV email delivery.

---

## Folder layout

```
retail-sales-reports/
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
