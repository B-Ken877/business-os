# Retail Stock Alerts

> Notifications when stock is low or items are out of stock.

**Component ID:** `retail-stock-alerts`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Watch stock levels and emit alerts (via the cross-cutting notifications-center) when a product drops below its low-stock threshold or reaches zero. Decouples alert routing from inventory tracking.

## Business problem solved

Inventory knows about stock levels; notifications knows about delivery channels. Without this component, the alert routing logic is duplicated or glued together ad-hoc. This component is the bridge: it watches levels and decides who to notify, when, and through what channel.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Evaluate current stock levels against thresholds
- Emit a low-stock notification when a product drops below threshold
- Emit an out-of-stock notification when a product reaches zero
- Suppress duplicate alerts within a configurable window
- Per-tenant alert routing (who gets notified)

## Dependencies

- `@business-os/shared`
- `retail-inventory`
- `notifications-center`

## Configuration options

- `suppressDuplicateHours` (`number`, default `6`) — Hours to suppress a duplicate alert for the same product.
- `alertRecipientRole` (`string`, default `"manager"`) — Role whose members receive alerts.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.stockalerts.evaluate`
- `retail.stockalerts.read`

## Data handled

Alert content (product name, current level, threshold), recipient identity, suppression timestamps.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- Alert emission is triggered explicitly via evaluateStockLevel — there is no automatic watcher yet. The orchestrator must call this after every stock adjustment.
- No multi-channel routing — all alerts go to the configured role.

## Future improvements

- Automatic watcher that subscribes to inventory changes.
- Multi-channel routing (SMS for critical, in-app for low).
- Alert acknowledgement workflow.

---

## Folder layout

```
retail-stock-alerts/
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
