/**
 * HTTP-shaped API contract for clinic-reminders.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Reminder } from "../backend/types";
import type { ScheduleReminderInput, CancelReminderInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-reminders/schedule-reminder",
    permission: "clinic.reminders.schedule",
    description: "Schedule a reminder for a patient.",
  },
  {
    method: "POST",
    path: "/v1/clinic-reminders/cancel-reminder",
    permission: "clinic.reminders.cancel",
    description: "Cancel a scheduled reminder.",
  },
];
