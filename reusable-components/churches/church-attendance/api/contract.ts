/**
 * HTTP-shaped API contract for church-attendance.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { ServiceAttendance } from "../backend/types";
import type { RecordAttendanceInput, IsDecliningInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/church-attendance/record-attendance",
    permission: "church.attendance.record",
    description: "Record a member's attendance for a service. Idempotent on (memberId, serviceDate).",
  },
  {
    method: "POST",
    path: "/v1/church-attendance/is-declining",
    permission: "church.attendance.read",
    description: "Check if a member has missed the last N consecutive services.",
  },
];
