# Church Donations

> Tithes, offerings, pledge tracking, giving history, and donation summaries.

**Component ID:** `church-donations`
**Industry:** Churches / faith-based
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Record donations (tithes, offerings, special gifts), track pledges over time, and produce giving summaries for tax and reporting purposes.

## Business problem solved

Donation records are often paper-based and error-prone. This component makes giving history queryable and auditable, while strictly limiting who can see a member's giving history.

## Supported industries

Churches / faith-based.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Record a donation (cash, mobile money, bank transfer)
- Track pledges and their fulfilment
- Compute per-member giving history
- Generate annual giving summaries
- Strict access control on giving history

## Dependencies

- `@business-os/shared`
- `church-member-management`
- `payments-or-collections`

## Configuration options

- `defaultCurrency` (`string`, default `"HTG"`) — Default currency.
- `requireFundDesignation` (`boolean`, default `true`) — Whether every donation must designate a fund (tithe, offering, building, etc.).

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `church.donations.record`
- `church.donations.read`
- `church.donations.read_member_history`

## Data handled

Donor identity (member id), amount, fund designation, payment method, date. Giving history reveals financial capacity and religious commitment — must be especially protected.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No pledge fulfilment tracking yet.
- No automatic tax receipt generation.

## Future improvements

- Pledge fulfilment tracking.
- Automatic tax receipt PDF.
- Recurring donation scheduling.

---

## Folder layout

```
church-donations/
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
