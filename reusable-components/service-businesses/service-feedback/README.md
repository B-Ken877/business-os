# Service Feedback

> Customer feedback, ratings, and issue tracking.

**Component ID:** `service-feedback`
**Industry:** Service-based businesses
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Collect customer feedback (rating + comments) after a service, and track issues that need follow-up.

## Business problem solved

Feedback is collected informally and lost. This component makes it queryable for service improvement.

## Supported industries

Service-based businesses.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Collect feedback per booking
- Rate 1-5 stars
- Track issues that need follow-up
- Per-tenant isolation

## Dependencies

- `@business-os/shared`
- `service-booking`

## Configuration options

- `minRatingForGood` (`number`, default `4`) — Rating threshold for 'good' feedback.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `service.feedback.create`
- `service.feedback.read`
- `service.feedback.respond`

## Data handled

Customer identity, rating, comments. Comments may contain personal context.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No response workflow yet.

## Future improvements

- Response workflow.
- Automatic feedback requests after booking completion.
- Sentiment analysis.

---

## Folder layout

```
service-feedback/
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
