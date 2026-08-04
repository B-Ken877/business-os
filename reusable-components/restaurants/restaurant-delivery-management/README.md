# Restaurant Delivery Management

> Delivery orders, addresses, driver assignment, and delivery status.

**Component ID:** `restaurant-delivery-management`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Track delivery orders from the kitchen to the customer: assign a driver, record pickup, and confirm delivery.

## Business problem solved

Delivery orders get lost between the kitchen and the driver. This component makes the delivery lifecycle queryable.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Assign a driver to a delivery order
- Record driver pickup
- Confirm delivery at the customer address
- Track delivery status

## Dependencies

- `@business-os/shared`
- `restaurant-order-management`

## Configuration options

- `maxActiveDeliveriesPerDriver` (`number`, default `3`) — Cap on simultaneous deliveries per driver.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.delivery.assign`
- `restaurant.delivery.update`
- `restaurant.delivery.read`

## Data handled

Customer address, driver identity, delivery status. Addresses are PII.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No GPS tracking.
- No driver app — driver identity is a string.

## Future improvements

- GPS tracking.
- Driver mobile app.
- Delivery time SLA reporting.

---

## Folder layout

```
restaurant-delivery-management/
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
