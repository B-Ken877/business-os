/**
 * HTTP-shaped API contract for church-volunteers.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Volunteer, VolunteerAssignment } from "../backend/types";
import type { CreateVolunteerInput, AssignVolunteerInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/church-volunteers/create-volunteer",
    permission: "church.volunteers.manage",
    description: "Create a volunteer record for a member.",
  },
  {
    method: "POST",
    path: "/v1/church-volunteers/assign-volunteer",
    permission: "church.volunteers.manage",
    description: "Assign a volunteer to an event or ministry. Enforces the max-assignments cap.",
  },
];
