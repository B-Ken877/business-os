/**
 * HTTP-shaped API contract for restaurant-shift-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Shift } from "../backend/types";
import type { CreateShiftInput, AddHandoffNotesInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-shift-management/create-shift",
    permission: "restaurant.shifts.manage",
    description: "Schedule a new shift.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-shift-management/add-handoff-notes",
    permission: "restaurant.shifts.manage",
    description: "Append handoff notes to a shift, for the next shift to read.",
  },
];
