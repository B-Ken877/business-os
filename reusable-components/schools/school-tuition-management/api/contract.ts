/**
 * HTTP-shaped API contract for school-tuition-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { TuitionPlan, TuitionPayment } from "../backend/types";
import type { CreateTuitionPlanInput, RecordTuitionPaymentInput, ComputeOutstandingBalanceInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-tuition-management/create-tuition-plan",
    permission: "school.tuition.manage",
    description: "Create a tuition plan for a student.",
  },
  {
    method: "POST",
    path: "/v1/school-tuition-management/record-tuition-payment",
    permission: "school.tuition.record_payment",
    description: "Record a tuition payment against a plan.",
  },
  {
    method: "POST",
    path: "/v1/school-tuition-management/compute-outstanding-balance",
    permission: "school.tuition.read",
    description: "Compute the outstanding balance for a plan.",
  },
];
