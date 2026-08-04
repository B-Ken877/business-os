/**
 * HTTP-shaped API contract for retail-promotions.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Promotion } from "../backend/types";
import type { CreatePromotionInput, ActivatePromotionInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/retail-promotions/create-promotion",
    permission: "retail.promotions.create",
    description: "Create a new promotion in draft status.",
  },
  {
    method: "POST",
    path: "/v1/retail-promotions/activate-promotion",
    permission: "retail.promotions.activate",
    description: "Activate a draft promotion. Enforces the active-promotion cap.",
  },
  {
    method: "GET",
    path: "/v1/retail-promotions/list-active-promotions",
    permission: "retail.promotions.read",
    description: "List all currently active promotions (status=active and within date range).",
  },
];
