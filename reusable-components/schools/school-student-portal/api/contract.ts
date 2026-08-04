/**
 * HTTP-shaped API contract for school-student-portal.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { StudentPortalSession } from "../backend/types";
import type { StartSessionInput, EndSessionInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-student-portal/start-session",
    permission: "school.portal.student.view",
    description: "Start a portal session for a student. The studentId is taken from the calling context's user identity, NOT from the request body.",
  },
  {
    method: "POST",
    path: "/v1/school-student-portal/end-session",
    permission: "school.portal.student.view",
    description: "End a portal session.",
  },
];
