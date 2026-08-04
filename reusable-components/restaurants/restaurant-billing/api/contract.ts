/**
 * HTTP-shaped API contract for restaurant-billing.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Bill } from "../backend/types";
import type { GenerateBillInput, MarkPaidInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-billing/generate-bill",
    permission: "restaurant.billing.generate",
    description: "Generate a bill from one or more orders.",
  },
  {
    method: "PATCH",
    path: "/v1/restaurant-billing/mark-paid",
    permission: "restaurant.billing.record_payment",
    description: "Mark a bill as paid after payment is recorded.",
  },
];
