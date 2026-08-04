# Service Invoicing

> Invoicing, payments, balances, and receipts.

**Component ID:** `service-invoicing`
**Industry:** Service-based businesses
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Generate invoices for completed services, track outstanding balances, and record payments.

## Business problem solved

Invoicing is disconnected from service delivery. This component links them.

## Supported industries

Service-based businesses.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Generate invoices from bookings or jobs
- Track outstanding balances
- Record payments (delegates to payments-or-collections)
- Generate receipts

## Dependencies

- `@business-os/shared`
- `service-booking`
- `payments-or-collections`

## Configuration options

- `defaultCurrency` (`string`, default `"HTG"`) — Default currency.
- `defaultTaxBps` (`number`, default `1000`) — Default tax rate.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `service.invoicing.generate`
- `service.invoicing.read`
- `service.invoicing.record_payment`

## Data handled

Invoice amounts, payment history, customer identity. Financial data — commercially sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No payment plan support.
- No multi-currency.

## Future improvements

- Payment plans.
- Multi-currency.
- Receipt PDF via document-management.

---

## Folder layout

```
service-invoicing/
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
