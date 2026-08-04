# Retail Customer Management

> Customer records, purchase history, loyalty notes, and contact data.

**Component ID:** `retail-customer-management`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Maintain a directory of a shop's customers, link each customer to their purchase history (sales recorded by the POS), and store loyalty notes (e.g. 'preferred customer, 5% discount on bulk').

## Business problem solved

Shops with regular customers have no central record of who they are, what they bought, or why they get a discount. This component makes customer data searchable and linkable to sales.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create customer records (name, phone, email, address)
- Link customers to sales (POS references customer id)
- Record loyalty notes per customer
- Mark customers as VIP / blacklisted
- Per-tenant isolation enforced

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxCustomersPerTenant` (`number`, default `100000`) — Cap on customer records.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.customers.create`
- `retail.customers.update`
- `retail.customers.read`

## Data handled

Customer name, phone, email, address, loyalty notes, status. Personally identifiable information; access must be logged.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No consent management — the future core:consent module will integrate here.
- No marketing opt-in/opt-out — a future version will add a marketing consent flag.

## Future improvements

- Consent management integration.
- Marketing opt-in/opt-out.
- Customer segmentation (e.g. 'frequent buyers').

---

## Folder layout

```
retail-customer-management/
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
