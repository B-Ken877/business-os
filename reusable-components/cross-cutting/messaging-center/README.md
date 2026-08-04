# Messaging Center

> Business notifications, reminders, and internal messaging across channels.

**Component ID:** `messaging-center`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Provide a single, channel-agnostic surface for sending operational messages (notifications, reminders, broadcasts) to staff, customers, patients, students, or members.

## Business problem solved

Haitian businesses today rely on personal WhatsApp accounts and informal channels to send appointment reminders, payment confirmations, and announcements. This is unreliable, unaccountable, and leaks business communication into personal devices. The messaging center gives every business a single API to send messages through any channel, with delivery tracking and audit history.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Send a message to one or many recipients
- Channel abstraction (SMS, email, WhatsApp, in-app) — caller does not know the channel
- Template-based messages with variable substitution
- Delivery status tracking (queued, sent, delivered, failed)
- Broadcast to a segment (e.g. all parents, all patients with appointments tomorrow)
- Per-tenant rate limiting to prevent abuse
- Audit trail of every message sent

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultChannel` (`string`, default `"in_app"`) — Channel used when the caller does not specify one.
- `maxBroadcastRecipients` (`number`, default `500`) — Hard cap on recipients per broadcast.
- `rateLimitPerMinute` (`number`, default `60`) — Max messages per tenant per minute.
- `retryFailedDeliveries` (`boolean`, default `true`) — Whether to retry failed deliveries up to the channel's limit.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `messaging.messages.send`
- `messaging.broadcasts.send`
- `messaging.messages.read`
- `messaging.templates.manage`

## Data handled

Message content, recipient contact details (phone/email/in-app id), delivery status, retry history. Message content may contain personal or commercial information depending on the use case.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No actual channel integration — the channel adapter is a separate concern owned by the platform's notification core when it is built.
- Templates are referenced by key but not managed by this component.
- No segmentation engine — broadcast recipients are passed in explicitly.

## Future improvements

- Template management operations (createTemplate, updateTemplate).
- Broadcast operation with rate-limited fan-out.
- Channel adapter registry so new channels (e.g. Telegram) can be added without modifying this component.

---

## Folder layout

```
messaging-center/
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
