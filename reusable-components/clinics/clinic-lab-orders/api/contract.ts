/**
 * HTTP-shaped API contract for clinic-lab-orders.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { LabOrder } from "../backend/types";
import type { OrderLabTestInput, RecordResultInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-lab-orders/order-lab-test",
    permission: "clinic.lab.order",
    description: "Order a lab test for a patient.",
  },
  {
    method: "POST",
    path: "/v1/clinic-lab-orders/record-result",
    permission: "clinic.lab.record_result",
    description: "Record a result document for a lab order. Marks the order as completed.",
  },
];
