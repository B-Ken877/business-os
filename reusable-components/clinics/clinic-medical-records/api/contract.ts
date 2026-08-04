/**
 * HTTP-shaped API contract for clinic-medical-records.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { MedicalRecord } from "../backend/types";
import type { CreateRecordInput, ListRecordsForPatientInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-medical-records/create-record",
    permission: "clinic.records.create",
    description: "Create a new medical record entry.",
  },
  {
    method: "GET",
    path: "/v1/clinic-medical-records/list-records-for-patient",
    permission: "clinic.records.read",
    description: "List all medical records for a patient. Every list call is audited.",
  },
];
