/**
 * HTTP-shaped API contract for school-attendance.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { AttendanceRecord } from "../backend/types";
import type { RecordAttendanceInput, ComputeAttendanceRateInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-attendance/record-attendance",
    permission: "school.attendance.record",
    description: "Record a student's attendance for a session. Idempotent on (studentId, sessionDate).",
  },
  {
    method: "POST",
    path: "/v1/school-attendance/compute-attendance-rate",
    permission: "school.attendance.read",
    description: "Compute a student's attendance rate over a date range. Returns absent percentage.",
  },
];
