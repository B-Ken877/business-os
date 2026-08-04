/**
 * HTTP-shaped API contract for restaurant-order-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Order } from "../backend/types";
import type { CreateOrderInput, AdvanceOrderStatusInput, CancelOrderInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-order-management/create-order",
    permission: "restaurant.orders.create",
    description: "Place a new order.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-order-management/advance-order-status",
    permission: "restaurant.orders.update_status",
    description: "Advance the order to the next status. Enforces the state machine.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-order-management/cancel-order",
    permission: "restaurant.orders.cancel",
    description: "Cancel an order. Only allowed before it's served.",
  },
];
