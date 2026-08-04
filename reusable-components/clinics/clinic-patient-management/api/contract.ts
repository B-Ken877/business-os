/**
 * HTTP-shaped API contract for clinic-patient-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Patient } from "../backend/types";
import type { CreatePatientInput, GetPatientInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-patient-management/create-patient",
    permission: "clinic.patients.create",
    description: "Create a new patient record. The medicalRecordNumber must be unique per tenant.",
  },
  {
    method: "GET",
    path: "/v1/clinic-patient-management/get-patient",
    permission: "clinic.patients.read",
    description: "Retrieve a patient by id. Every read is audited \u2014 see security-rules.md \u00a75.",
  },
];
