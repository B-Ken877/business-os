# API Contract — `clinic-appointments`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `scheduleAppointment`

**Permission required:** `clinic.appointments.schedule`

**Description:** Schedule a new appointment. Detects doctor double-booking.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `doctorStaffId` | `string` | yes |  |
| `scheduledAt` | `string` | yes |  |
| `durationMinutes` | `number` | yes |  |
| `reason` | `string` | no |  |

**Returns:** `Result<Appointment>`

**Audit:** emits an entry with action `clinic.appointment.scheduled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `cancelAppointment`

**Permission required:** `clinic.appointments.cancel`

**Description:** Cancel an appointment.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `appointmentId` | `string` | yes |  |

**Returns:** `Result<Appointment>`

**Audit:** emits an entry with action `clinic.appointment.cancelled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
