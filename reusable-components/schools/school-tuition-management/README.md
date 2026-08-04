# School Tuition Management

> Tuition plans, payments, balances, due dates, and reminders.

**Component ID:** `school-tuition-management`
**Industry:** Schools / education
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Track each student's tuition plan (amount, due dates), record payments, and compute outstanding balances.

## Business problem solved

Schools track tuition in notebooks and miss payments. This component makes balances queryable and automatable.

## Supported industries

Schools / education.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create tuition plans per student
- Record tuition payments (delegates to payments-or-collections)
- Compute outstanding balance
- Trigger reminders via notifications-center

## Dependencies

- `@business-os/shared`
- `school-student-enrollment`
- `payments-or-collections`

## Configuration options

- `defaultPlanInstallments` (`number`, default `10`) — Default number of installments.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `school.tuition.manage`
- `school.tuition.read`
- `school.tuition.record_payment`

## Data handled

Tuition amounts, payment history, outstanding balances. Financial data — commercially sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No automatic reminders — orchestrator must check balances and call notifications-center.
- No installment-level payment allocation.

## Future improvements

- Automatic reminders.
- Installment-level allocation.
- Scholarship/discount support.

---

## Folder layout

```
school-tuition-management/
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
