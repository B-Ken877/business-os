# Retail Point of Sale

> Checkout flow, cart handling, totals, discounts, payment recording, and receipts.

**Component ID:** `retail-point-of-sale`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Provide the checkout capability: build a cart of products, apply discounts, compute totals with tax, record payment, and emit a receipt. The POS is the integration point between product-catalog, inventory, and payments.

## Business problem solved

Without a structured POS, shopkeepers rely on mental arithmetic and cash register tapes, leading to incorrect totals, missed tax, and no link between a sale and the inventory it depleted. This component makes checkout a single API call.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create a cart with one or more line items
- Apply cart-level or item-level discounts
- Compute subtotals, tax, and grand total
- Record payment (delegates to payments-or-collections)
- Decrement stock on checkout (delegates to retail-inventory)
- Emit a receipt reference (delegates to document-management)

## Dependencies

- `@business-os/shared`
- `retail-product-catalog`
- `retail-inventory`
- `payments-or-collections`

## Configuration options

- `defaultTaxRateBps` (`number`, default `1000`) — Default tax rate in basis points (1000 = 10%).
- `currency` (`string`, default `"HTG"`) — POS currency.
- `allowNegativeCartTotal` (`boolean`, default `false`) — Whether a cart can have a negative total after discounts (forbidden by default).

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.pos.checkout`
- `retail.pos.refund`
- `retail.pos.read`

## Data handled

Cart contents, line item quantities, discount codes applied, payment method, totals. Cart data is commercially sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- Stock decrement and payment recording are NOT performed by this operation — the orchestrator must call retail-inventory.adjustStock and payments-or-collections.recordPayment separately. A future core:workflow module will compose these into a single transaction.
- No partial refunds — a sale is fully completed or not.
- No multi-currency — the sale uses the configured currency.

## Future improvements

- Atomic checkout that composes inventory + payments in a single transaction.
- Partial refunds.
- Receipt PDF generation via document-management.

---

## Folder layout

```
retail-point-of-sale/
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
