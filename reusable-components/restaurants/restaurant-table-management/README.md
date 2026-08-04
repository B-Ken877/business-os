# Restaurant Table Management

> Tables, seating, table status, occupancy, and table assignments.

**Component ID:** `restaurant-table-management`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Maintain the floor plan: tables, their capacity, current occupancy, and the order currently assigned to each.

## Business problem solved

Without a table map, hosts seat customers at already-occupied tables and servers can't find their orders. This component makes table state queryable.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Define tables with capacity
- Track table status (free, seated, dirty)
- Assign an order to a table
- Release a table when the order is served

## Dependencies

- `@business-os/shared`
- `restaurant-order-management`

## Configuration options

- `maxTablesPerTenant` (`number`, default `100`) — Cap on tables.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.tables.manage`
- `restaurant.tables.read`
- `restaurant.tables.assign`

## Data handled

Table identifiers, capacity, occupancy status. Not sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No floor-plan layout (positions, shapes) — just labels and capacity.
- No table combining/splitting.

## Future improvements

- Floor-plan layout.
- Table combining/splitting.
- Reservation integration.

---

## Folder layout

```
restaurant-table-management/
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
