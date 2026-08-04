/**
 * HTTP-shaped API contract for school-student-enrollment.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Student } from "../backend/types";
import type { EnrollStudentInput, UpdateEnrollmentStatusInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-student-enrollment/enroll-student",
    permission: "school.students.create",
    description: "Enroll a new student.",
  },
  {
    method: "PATCH",
    path: "/v1/school-student-enrollment/update-enrollment-status",
    permission: "school.students.update",
    description: "Update a student's enrollment status.",
  },
];
