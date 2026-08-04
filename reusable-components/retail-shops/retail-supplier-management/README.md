# Retail Supplier Management

> Suppliers, purchase history, restocking, and supplier contact records.

**Component ID:** `retail-supplier-management`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Maintain a directory of a shop's suppliers, record purchase orders and receipts, and provide the data the inventory component needs to know 'where did this stock come from?'

## Business problem solved

Shops juggle multiple suppliers (wholesalers, distributors, importers) with no central record. Reordering relies on memory. This component makes supplier contact info and purchase history searchable.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create supplier records (name, contact, terms)
- Record purchase orders (PO) per supplier
- Mark POs as received (links to inventory restock)
- Track payment terms per supplier
- Per-tenant isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultPaymentTermsDays` (`number`, default `30`) — Default payment terms (days).

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.suppliers.manage`
- `retail.suppliers.read`
- `retail.purchaseorders.create`
- `retail.purchaseorders.receive`

## Data handled

Supplier name, contact details (phone, email, address), payment terms, PO line items. Supplier terms are commercially sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No supplier invoice reconciliation.
- No multi-currency POs.
- Stock increment on PO receipt is delegated, not atomic.

## Future improvements

- Supplier invoice matching.
- Multi-currency POs with FX.
- Automatic PO creation when stock drops below threshold.

---

## Folder layout

```
retail-supplier-management/
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
