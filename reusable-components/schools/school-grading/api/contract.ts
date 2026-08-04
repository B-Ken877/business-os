/**
 * HTTP-shaped API contract for school-grading.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Grade, Assessment } from "../backend/types";
import type { RecordGradeInput, ComputeStudentAverageInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-grading/record-grade",
    permission: "school.grades.record",
    description: "Record a student's grade for an assessment. Idempotent on (studentId, assessmentId).",
  },
  {
    method: "POST",
    path: "/v1/school-grading/compute-student-average",
    permission: "school.grades.read",
    description: "Compute a student's overall average across all assessments.",
  },
];
