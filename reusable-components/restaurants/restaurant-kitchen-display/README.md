# Restaurant Kitchen Display

> Kitchen ticket workflows, prep status, order prioritization, and station routing.

**Component ID:** `restaurant-kitchen-display`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Show the kitchen what to cook, in what order, with special instructions visible. Decouples the kitchen's view from the order's source (dine-in, takeout, delivery).

## Business problem solved

Paper tickets pile up, get lost, and don't show priority. This component makes the kitchen's queue queryable and sortable.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Generate a kitchen ticket from an order
- Mark ticket items as in_prep and ready
- Sort tickets by priority and placement time
- Route tickets to stations (grill, salad, etc.)

## Dependencies

- `@business-os/shared`
- `restaurant-order-management`

## Configuration options

- `maxTicketsPerStation` (`number`, default `50`) — Cap on open tickets per station.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.kitchen.tickets.read`
- `restaurant.kitchen.tickets.update`

## Data handled

Ticket contents (mirror of order items), station routing, prep status. Not sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No station routing automation — station is set at ticket creation.
- No prep-time tracking yet.

## Future improvements

- Automatic station routing based on item type.
- Prep-time tracking for SLA reporting.
- Bump bar integration.

---

## Folder layout

```
restaurant-kitchen-display/
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
