# Service Catalog

> List of services, descriptions, pricing, and durations.

**Component ID:** `service-catalog`
**Industry:** Service-based businesses
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Define the services a business offers, with pricing and typical duration. The foundation for quotes, bookings, and invoicing.

## Business problem solved

Service businesses lack a structured catalog, leading to inconsistent pricing and missed upsells. This component makes services queryable.

## Supported industries

Service-based businesses.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create services with name, description, price, duration
- Organize services into categories
- Mark services as active/inactive
- Per-tenant isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultCurrency` (`string`, default `"HTG"`) — Default currency.
- `maxServicesPerTenant` (`number`, default `1000`) — Cap on services.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `service.catalog.manage`
- `service.catalog.read`

## Data handled

Service name, description, price, duration. Generally not sensitive but commercially valuable.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No variant support (e.g. small/medium/large).

## Future improvements

- Service variants.
- Bundle pricing.
- Capacity tracking (max concurrent bookings).

---

## Folder layout

```
service-catalog/
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
