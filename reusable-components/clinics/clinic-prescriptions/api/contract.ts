/**
 * HTTP-shaped API contract for clinic-prescriptions.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Prescription } from "../backend/types";
import type { CreatePrescriptionInput, RefillPrescriptionInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-prescriptions/create-prescription",
    permission: "clinic.prescriptions.create",
    description: "Create a new prescription.",
  },
  {
    method: "POST",
    path: "/v1/clinic-prescriptions/refill-prescription",
    permission: "clinic.prescriptions.refill",
    description: "Refill a prescription. Decrements refillsRemaining; deactivates when 0.",
  },
];
