/**
 * HTTP-shaped API contract for restaurant-delivery-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Delivery } from "../backend/types";
import type { AssignDriverInput, ConfirmDeliveredInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-delivery-management/assign-driver",
    permission: "restaurant.delivery.assign",
    description: "Assign a driver to a delivery.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-delivery-management/confirm-delivered",
    permission: "restaurant.delivery.update",
    description: "Confirm a delivery was completed.",
  },
];
