# Restaurant Billing

> Bills, service fees, discounts, payment status, and receipt generation.

**Component ID:** `restaurant-billing`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Generate a bill from an order (or table's orders), apply service charges and discounts, and record payment. Distinct from POS because restaurant billing handles multi-order tables, service charges, and tip splitting.

## Business problem solved

Restaurant billing has unique rules (service charge, tip, multi-order tables) that retail POS doesn't. This component encapsulates those rules.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Generate a bill from one or more orders
- Apply service charge and tip
- Record payment (delegates to payments-or-collections)
- Generate receipt

## Dependencies

- `@business-os/shared`
- `restaurant-order-management`
- `payments-or-collections`

## Configuration options

- `defaultServiceChargeBps` (`number`, default `0`) — Default service charge in basis points (0 = none).
- `defaultTaxBps` (`number`, default `1000`) — Default tax rate in basis points (10%).

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.billing.generate`
- `restaurant.billing.read`
- `restaurant.billing.record_payment`

## Data handled

Bill totals, service charge, tip, payment references. Commercially sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- Subtotal is a placeholder until the order store is wired.
- No tip splitting.
- No multi-currency.

## Future improvements

- Order store integration.
- Tip splitting.
- Receipt PDF via document-management.

---

## Folder layout

```
restaurant-billing/
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
