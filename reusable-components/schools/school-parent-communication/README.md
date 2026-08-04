# School Parent Communication

> Parent contact management, messages, announcements, and alerts.

**Component ID:** `school-parent-communication`
**Industry:** Schools / education
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Send messages and announcements to parents (individual or broadcast), with delivery tracking via messaging-center.

## Business problem solved

School-parent communication is scattered across WhatsApp groups. This component centralises it and links each message to the student record.

## Supported industries

Schools / education.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Send a message to a parent (via messaging-center)
- Broadcast announcements to all parents
- Track delivery status
- Per-student communication history

## Dependencies

- `@business-os/shared`
- `school-student-enrollment`
- `messaging-center`

## Configuration options

- `broadcastRateLimitPerHour` (`number`, default `10`) — Cap on broadcasts per hour.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `school.parent_comm.send`
- `school.parent_comm.read`
- `school.parent_comm.broadcast`

## Data handled

Parent identity, message content, delivery status. Messages may contain academic or disciplinary information.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No actual delivery via messaging-center — the orchestrator must call messaging-center.sendMessage.

## Future improvements

- Atomic send via messaging-center.
- Two-way inbound messaging.
- Read receipts.

---

## Folder layout

```
school-parent-communication/
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
