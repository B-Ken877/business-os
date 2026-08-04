# Activity Timeline

> Audit-friendly operational event history for any entity.

**Component ID:** `activity-timeline`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Provide a single tenant-scoped surface that aggregates operational events (created, updated, status changed, payment recorded, etc.) into a queryable timeline per entity, so staff and auditors can see 'what happened to this customer/order/invoice' without scanning audit logs.

## Business problem solved

Audit logs are great for security but poor for operational visibility — they record every event but are not indexed by entity. This component indexes events by entity, providing a fast 'give me everything that happened to entity X' query that powers UI timelines and audit summaries.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Record an event for an entity (entityType, entityId, action, summary)
- List events for an entity, newest first
- Filter by action, actor, or time window
- Per-tenant isolation enforced
- Events are immutable once recorded

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxEventsPerEntity` (`number`, default `10000`) — Cap on events stored per entity; older events are archived.
- `summaryMaxLength` (`number`, default `500`) — Maximum characters for an event's summary field.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `timeline.events.record`
- `timeline.events.read`

## Data handled

Event action, summary text, actor identity, entity reference, timestamp. Summaries may contain operational context that references underlying sensitive data.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No streaming — events are polled.
- No archiving yet — once the per-entity cap is reached, future versions will archive old events to cold storage.
- No cross-entity correlation — events are strictly per-entity.

## Future improvements

- Webhook subscription so UIs can render events in real time.
- Cross-entity correlation (e.g. 'show me everything that happened to this customer AND their orders').
- Event categorisation for filtering (financial, operational, etc.).

---

## Folder layout

```
activity-timeline/
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
