# Retail Promotions

> Discounts, bundles, promo rules, and seasonal campaigns.

**Component ID:** `retail-promotions`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Define promotional rules (percentage off, fixed discount, buy-X-get-Y) that the POS applies at checkout, with start/end dates so campaigns are time-bounded.

## Business problem solved

Shops run ad-hoc promotions ('20% off all sodas this week') with no central record. Cashiers apply discounts manually and inconsistently. This component makes promotions a declared, time-bounded, audited capability.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create promotions with start/end dates
- Percentage discount, fixed discount, or bundle
- Scope promotions to categories or specific products
- Activate/deactivate promotions
- Per-tenant isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxActivePromotionsPerTenant` (`number`, default `20`) — Cap on simultaneously active promotions.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.promotions.create`
- `retail.promotions.update`
- `retail.promotions.activate`
- `retail.promotions.read`

## Data handled

Promotion rules, scope (products/categories), date ranges. Not sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No automatic expiry — promotions stay 'active' even after their end date passes; the caller must filter by date. A future version will auto-expire.
- No conflict resolution — if two promotions apply to the same product, the POS decides which to apply.

## Future improvements

- Automatic expiry when end date passes.
- Conflict resolution rules (best for customer, best for shop, etc.).
- Bundle pricing (X + Y for Z).

---

## Folder layout

```
retail-promotions/
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
