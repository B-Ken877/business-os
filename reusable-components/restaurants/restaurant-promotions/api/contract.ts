/**
 * HTTP-shaped API contract for restaurant-promotions.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Coupon } from "../backend/types";
import type { CreateCouponInput, RedeemCouponInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-promotions/create-coupon",
    permission: "restaurant.promotions.manage",
    description: "Create a new coupon.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-promotions/redeem-coupon",
    permission: "restaurant.promotions.redeem",
    description: "Redeem a coupon. Increments the redemption count and enforces the max.",
  },
];
