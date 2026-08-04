/**
 * HTTP-shaped API contract for school-class-scheduling.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { ClassSession } from "../backend/types";
import type { ScheduleSessionInput, ListSessionsForTeacherInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-class-scheduling/schedule-session",
    permission: "school.scheduling.manage",
    description: "Schedule a class session. Detects teacher and room conflicts.",
  },
  {
    method: "GET",
    path: "/v1/school-class-scheduling/list-sessions-for-teacher",
    permission: "school.scheduling.read",
    description: "List all sessions assigned to a teacher.",
  },
];
