# Restaurant Shift Management

> Staff shifts, work schedules, shift notes, and handoff information.

**Component ID:** `restaurant-shift-management`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Schedule staff shifts, record shift notes ('fridge temperature was high'), and pass handoff information between shifts.

## Business problem solved

Shift changes lose context. This component makes the handoff explicit and audited.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Assign staff to shifts
- Record shift notes
- Hand off to the next shift with a summary

## Dependencies

- `@business-os/shared`

## Configuration options

- `minShiftNoticeMinutes` (`number`, default `60`) — Minimum notice for shift changes.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.shifts.manage`
- `restaurant.shifts.read`

## Data handled

Staff identity, shift times, handoff notes. Notes may contain operational context.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No conflict detection (double-booking a staff member).
- No payroll integration.

## Future improvements

- Conflict detection.
- Payroll integration.
- Shift swap requests.

---

## Folder layout

```
restaurant-shift-management/
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
