# Restaurant Promotions

> Coupons, happy hour rules, combo offers, and promotions.

**Component ID:** `restaurant-promotions`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Define restaurant-specific promotions: happy hour (time-bounded discount on a category), combo (X+Y for Z), and coupons (code-based discount).

## Business problem solved

Restaurant promotions are more complex than retail (time-of-day rules, combos). This component encodes those rules.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Happy hour (time-bounded category discount)
- Combo pricing (X+Y for Z)
- Coupon codes
- Activation/deactivation

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxActiveCoupons` (`number`, default `50`) — Cap on active coupons.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.promotions.manage`
- `restaurant.promotions.read`
- `restaurant.promotions.redeem`

## Data handled

Promotion rules, coupon codes, redemption history. Not sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No happy hour or combo support yet — only coupons.
- No per-customer redemption limits.

## Future improvements

- Happy hour rules.
- Combo pricing.
- Per-customer redemption limits.

---

## Folder layout

```
restaurant-promotions/
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
