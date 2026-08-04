/**
 * HTTP-shaped API contract for clinic-triage.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { TriageEntry } from "../backend/types";
import type { RecordTriageInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-triage/record-triage",
    permission: "clinic.triage.intake",
    description: "Record a triage entry at patient intake.",
  },
  {
    method: "GET",
    path: "/v1/clinic-triage/list-emergency-triage",
    permission: "clinic.triage.read",
    description: "List all triage entries classified as emergency, newest first.",
  },
];
