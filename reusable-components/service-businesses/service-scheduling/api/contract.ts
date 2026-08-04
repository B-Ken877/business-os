/**
 * HTTP-shaped API contract for service-scheduling.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { StaffAvailability, TimeOff } from "../backend/types";
import type { SetWorkingHoursInput, IsAvailableInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/service-scheduling/set-working-hours",
    permission: "service.scheduling.manage",
    description: "Set a staff member's working hours for a day.",
  },
  {
    method: "POST",
    path: "/v1/service-scheduling/is-available",
    permission: "service.scheduling.read",
    description: "Check if a staff member is available at a given time (within working hours and not on time off).",
  },
];
