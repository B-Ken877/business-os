# Church Events

> Service events, programs, event schedules, and registrations.

**Component ID:** `church-events`
**Industry:** Churches / faith-based
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Define church events (services, conferences, retreats), their schedules, and track registrations.

## Business problem solved

Church events are announced from the pulpit and forgotten. This component makes events queryable and registration trackable.

## Supported industries

Churches / faith-based.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create events with date/time/location
- Track event capacity
- Register attendees
- Per-tenant isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultCapacity` (`number`, default `200`) — Default event capacity.
- `allowOverRegistration` (`boolean`, default `false`) — Whether to allow registration beyond capacity.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `church.events.manage`
- `church.events.read`
- `church.events.register`

## Data handled

Event metadata, attendee registrations. Registrations reveal religious participation; treat as sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No waitlist.
- No event cancellation/notifications yet.

## Future improvements

- Waitlist.
- Event cancellation with notifications.
- Recurring events.

---

## Folder layout

```
church-events/
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
