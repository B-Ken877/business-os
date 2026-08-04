/**
 * HTTP-shaped API contract for school-teacher-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Teacher } from "../backend/types";
import type { CreateTeacherInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-teacher-management/create-teacher",
    permission: "school.teachers.manage",
    description: "Create a new teacher record.",
  },
  {
    method: "GET",
    path: "/v1/school-teacher-management/list-teachers",
    permission: "school.teachers.read",
    description: "List all teachers.",
  },
];
