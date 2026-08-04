# Service Booking

> Appointment/service booking, time slots, and status tracking.

**Component ID:** `service-booking`
**Industry:** Service-based businesses
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Book services for specific time slots, with conflict detection against staff schedules.

## Business problem solved

Bookings are taken on phone and paper, leading to double-booking. This component makes bookings queryable and conflict-aware.

## Supported industries

Service-based businesses.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Book a service for a time slot
- Detect staff scheduling conflicts
- Track booking status (confirmed, completed, cancelled, no_show)
- Per-tenant isolation

## Dependencies

- `@business-os/shared`
- `service-catalog`
- `service-customer-management`
- `service-scheduling`

## Configuration options

- `slotGranularityMinutes` (`number`, default `15`) — Slot granularity for conflict detection.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `service.bookings.create`
- `service.bookings.read`
- `service.bookings.update_status`
- `service.bookings.cancel`

## Data handled

Customer identity, service, time, staff assignment. PII.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No automatic reminders.
- No customer self-booking.

## Future improvements

- Automatic reminders via notifications-center.
- Customer self-booking portal.
- Deposit/prepayment.

---

## Folder layout

```
service-booking/
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
