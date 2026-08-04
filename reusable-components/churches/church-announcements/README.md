# Church Announcements

> Public announcements, internal notices, and broadcast messages.

**Component ID:** `church-announcements`
**Industry:** Churches / faith-based
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Publish announcements (public-facing) and internal notices (staff-facing), with broadcast via messaging-center.

## Business problem solved

Announcements are read once from the pulpit and forgotten. This component makes them queryable and broadcastable.

## Supported industries

Churches / faith-based.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Publish announcements with expiry
- Target announcements to specific groups
- Broadcast via messaging-center
- Per-tenant isolation

## Dependencies

- `@business-os/shared`
- `messaging-center`

## Configuration options

- `defaultExpiryDays` (`number`, default `7`) — Default days until an announcement expires.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `church.announcements.publish`
- `church.announcements.read`

## Data handled

Announcement title, body, audience, expiry. Body may contain operational or pastoral content.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No broadcast via messaging-center — the orchestrator must call messaging-center.sendMessage per recipient.

## Future improvements

- Atomic broadcast via messaging-center.
- Scheduled announcements.
- Read receipts.

---

## Folder layout

```
church-announcements/
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
