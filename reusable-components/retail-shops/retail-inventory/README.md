# Retail Inventory

> Stock tracking, quantities, low-stock alerts, stock adjustments, and movement history.

**Component ID:** `retail-inventory`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Track the quantity of each product the shop has on hand, record adjustments (restocking, shrinkage, damages), and maintain a complete movement history so the shop can answer 'where did my stock go?'

## Business problem solved

Haitian shops lose sales because they don't know they're out of stock until a customer asks, and they lose money to shrinkage they can't trace. This component makes stock levels visible and every change auditable.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Track current stock level per product
- Record stock movements (in: restock; out: sale; adjustment: shrinkage)
- Configure low-stock threshold per product
- Trigger low-stock alerts (via cross-cutting notifications-center)
- Full movement history per product

## Dependencies

- `@business-os/shared`
- `retail-product-catalog`

## Configuration options

- `defaultLowStockThreshold` (`number`, default `5`) — Default threshold below which a low-stock alert fires.
- `allowNegativeStock` (`boolean`, default `false`) — Whether stock can go below zero (forbidden by default).
- `maxMovementsPerProduct` (`number`, default `10000`) — Cap on movement history per product.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.inventory.read`
- `retail.inventory.adjust`
- `retail.inventory.restock`
- `retail.inventory.thresholds.manage`

## Data handled

Stock quantities, movement reasons, actor identity. Movement reasons may include commercial context (e.g. supplier name, customer reference).

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No multi-location support — each product has one stock level per tenant.
- No batch/lot tracking.
- No automatic reorder — alerts fire but a purchase order is not auto-created.

## Future improvements

- Multi-location inventory.
- Batch/lot tracking with expiry.
- Automatic reorder when stock drops below threshold.

---

## Folder layout

```
retail-inventory/
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
