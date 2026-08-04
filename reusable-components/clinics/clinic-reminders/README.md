# Clinic Reminders

> Appointment reminders, medication reminders, and follow-up reminders.

**Component ID:** `clinic-reminders`
**Industry:** Clinics / medical
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Generate reminders for appointments, medication schedules, and follow-up visits, dispatched via notifications-center.

## Business problem solved

Patients miss appointments and forget medications. This component makes reminders queryable and schedulable.

## Supported industries

Clinics / medical.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Schedule appointment reminders
- Schedule medication reminders
- Schedule follow-up reminders
- Dispatch via notifications-center

## Dependencies

- `@business-os/shared`
- `clinic-patient-management`
- `notifications-center`

## Configuration options

- `defaultReminderLeadMinutes` (`number`, default `60`) — Default minutes before the event to send a reminder.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `clinic.reminders.schedule`
- `clinic.reminders.read`
- `clinic.reminders.cancel`

## Data handled

Patient identity, reminder type, scheduled time. Reveals medical context (e.g. medication reminders); sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No automatic dispatch — orchestrator must poll due reminders and call notifications-center.

## Future improvements

- Automatic dispatch via a scheduler.
- Patient self-management of reminders.

---

## Folder layout

```
clinic-reminders/
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
