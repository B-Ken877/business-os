/**
 * HTTP-shaped API contract for clinic-appointments.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Appointment } from "../backend/types";
import type { ScheduleAppointmentInput, CancelAppointmentInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-appointments/schedule-appointment",
    permission: "clinic.appointments.schedule",
    description: "Schedule a new appointment. Detects doctor double-booking.",
  },
  {
    method: "POST",
    path: "/v1/clinic-appointments/cancel-appointment",
    permission: "clinic.appointments.cancel",
    description: "Cancel an appointment.",
  },
];
