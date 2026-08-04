# Service Quotes

> Estimates, quote generation, and quote approval flow.

**Component ID:** `service-quotes`
**Industry:** Service-based businesses
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Generate quotes for prospective customers (one or more services at a stated price), track approval, and convert approved quotes to bookings.

## Business problem solved

Quotes are ad-hoc and untracked. This component makes the quote-to-booking pipeline queryable.

## Supported industries

Service-based businesses.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Generate quotes with line items
- Track quote status (draft, sent, approved, rejected, expired)
- Approve or reject quotes
- Per-tenant isolation

## Dependencies

- `@business-os/shared`
- `service-catalog`

## Configuration options

- `defaultExpiryDays` (`number`, default `30`) — Default quote validity days.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `service.quotes.create`
- `service.quotes.read`
- `service.quotes.approve`
- `service.quotes.reject`

## Data handled

Quote line items, totals, customer identity. Commercially sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No automatic expiry.
- No PDF generation.

## Future improvements

- Automatic expiry.
- PDF generation via document-management.
- Quote-to-booking conversion.

---

## Folder layout

```
service-quotes/
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
