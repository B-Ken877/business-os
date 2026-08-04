# Clinic Appointments

> Appointment scheduling, rescheduling, cancellations, and reminders.

**Component ID:** `clinic-appointments`
**Industry:** Clinics / medical
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Schedule patient appointments with specific doctors, reschedule or cancel them, and trigger reminders via notifications-center.

## Business problem solved

Paper appointment books lead to double-booking and missed appointments. This component makes scheduling queryable and conflict-aware.

## Supported industries

Clinics / medical.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Schedule appointments (patient, doctor, time)
- Detect scheduling conflicts
- Reschedule and cancel
- Trigger reminders

## Dependencies

- `@business-os/shared`
- `clinic-patient-management`
- `clinic-staff-management`

## Configuration options

- `slotDurationMinutes` (`number`, default `30`) — Default appointment slot length.
- `reminderLeadMinutes` (`number`, default `60`) — Minutes before appointment to send a reminder.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `clinic.appointments.schedule`
- `clinic.appointments.read`
- `clinic.appointments.cancel`
- `clinic.appointments.reschedule`

## Data handled

Patient identity, doctor identity, appointment time, reason for visit. Reveals health conditions via the visit reason; sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No automatic reminders — orchestrator must check upcoming appointments and call notifications-center.
- No patient self-scheduling.

## Future improvements

- Automatic reminders.
- Patient self-scheduling portal.
- Waitlist management.

---

## Folder layout

```
clinic-appointments/
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
