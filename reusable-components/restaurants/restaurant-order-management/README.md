# Restaurant Order Management

> Customer orders, order status, notes, special instructions, and fulfillment flow.

**Component ID:** `restaurant-order-management`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Capture customer orders (dine-in, takeout, delivery), track their status from placed → in_kitchen → ready → served, and route them to the kitchen display.

## Business problem solved

Paper tickets get lost, special instructions are forgotten, and there's no central record of what's pending. This component makes orders a queryable, stateful entity.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create an order with line items (menu item + modifiers + quantity)
- Track order status (placed, in_kitchen, ready, served, cancelled)
- Record special instructions (e.g. 'no onions', 'extra spicy')
- Link to a table (dine-in) or address (delivery)
- State machine enforces valid transitions

## Dependencies

- `@business-os/shared`
- `restaurant-menu`

## Configuration options

- `maxItemsPerOrder` (`number`, default `50`) — Cap on line items per order.
- `defaultFulfillmentType` (`string`, default `"dine_in"`) — Default fulfillment type.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.orders.create`
- `restaurant.orders.update_status`
- `restaurant.orders.read`
- `restaurant.orders.cancel`

## Data handled

Order contents, customer notes, table/address reference, status history. Notes may contain dietary or allergy information.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No payment integration in this component — see restaurant-billing.
- No automatic table release on served.

## Future improvements

- Atomic order+payment.
- Automatic table release.
- Order modification after placement.

---

## Folder layout

```
restaurant-order-management/
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
