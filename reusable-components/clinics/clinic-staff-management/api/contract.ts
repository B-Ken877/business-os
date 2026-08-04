/**
 * HTTP-shaped API contract for clinic-staff-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Staff } from "../backend/types";
import type { CreateStaffInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-staff-management/create-staff",
    permission: "clinic.staff.manage",
    description: "Create a new staff record.",
  },
  {
    method: "GET",
    path: "/v1/clinic-staff-management/list-doctors",
    permission: "clinic.staff.read",
    description: "List all staff with the 'doctor' role.",
  },
];
