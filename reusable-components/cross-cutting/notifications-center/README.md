# Notifications Center

> In-app notifications with channel-agnostic delivery abstraction.

**Component ID:** `notifications-center`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Provide the in-app surface for notifications a user sees when they log in — distinct from messaging-center (which sends outbound messages) and activity-timeline (which records operational events). This component manages the user's notification inbox: unread, read, dismissed.

## Business problem solved

Without a notification inbox, every component that wants to alert a user (low-stock warning, new enrollment, appointment reminder) invents its own UI and storage. This component standardises the inbox so the future UI has one source of truth for 'what does this user need to see?'.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Push a notification to a user's inbox
- Mark as read, mark as dismissed
- List unread notifications for the current user
- Per-tenant per-user isolation
- Expiry: notifications auto-expire after a configurable window

## Dependencies

- `@business-os/shared`
- `reusable-components/cross-cutting/messaging-center`

## Configuration options

- `defaultExpiryHours` (`number`, default `168`) — Hours after which a notification expires (default 7 days).
- `maxPerUser` (`number`, default `1000`) — Cap on notifications stored per user; oldest are pruned.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `notifications.push`
- `notifications.read`
- `notifications.dismiss`

## Data handled

Notification title, body, action link, recipient user id, read/dismissed status, expiry timestamp. Body may reference underlying sensitive data but only contains a summary.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No push to actual devices — the future UI layer will poll or use websockets.
- No priority levels yet — all notifications are equal.
- No grouping/bundling — every push creates a separate inbox entry.

## Future improvements

- WebSocket-based real-time delivery.
- Priority levels (info, warning, critical).
- Notification grouping (e.g. '5 new orders').

---

## Folder layout

```
notifications-center/
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
