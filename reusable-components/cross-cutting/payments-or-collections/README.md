# Payments & Collections

> Payment recording, collection tracking, balances, and payment status.

**Component ID:** `payments-or-collections`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Provide a single tenant-scoped surface for recording payments received from customers (cash, card, mobile money, bank transfer), tracking outstanding balances, and reconciling payments against invoices — without touching raw card data, which is delegated to a PCI-compliant provider.

## Business problem solved

Every business that accepts payments (retail, restaurant, clinic, school, service) reinvents payment recording. This component standardises the payment record shape so a future reporting layer can answer 'how much did we collect this week?' across all components.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Record a payment (method, amount, currency, reference)
- Attach a payment to an invoice or stand-alone
- Track outstanding balance per invoice
- Mark a payment as reconciled
- Refund a payment (with audit)
- Per-tenant isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultCurrency` (`string`, default `"HTG"`) — Default currency code (ISO 4217).
- `supportedMethods` (`ReadonlyArray<string>`, default `["cash","card","mobile_money","bank_transfer"]`) — Payment methods accepted.
- `requireReferenceForNonCash` (`boolean`, default `true`) — Whether non-cash payments must include a provider transaction reference.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `payments.record`
- `payments.read`
- `payments.refund`
- `payments.reconcile`

## Data handled

Payment amount, currency, method, provider transaction reference, attached invoice id, payer identity, refund chain. Payment references are commercially sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No actual payment provider integration — the provider adapter is a separate concern.
- Single-currency in this increment — multi-currency support will follow.
- No partial refunds — refunds are full-amount only in this increment.

## Future improvements

- Multi-currency support with FX conversion.
- Partial refunds.
- Reconciliation against provider settlement reports.

---

## Folder layout

```
payments-or-collections/
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
