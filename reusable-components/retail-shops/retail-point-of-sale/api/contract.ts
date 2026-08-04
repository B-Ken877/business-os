/**
 * HTTP-shaped API contract for retail-point-of-sale.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Sale } from "../backend/types";
import type { CheckoutInput, GetSaleInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/retail-point-of-sale/checkout",
    permission: "retail.pos.checkout",
    description: "Process a cart: compute totals, record payment, decrement stock, and create a Sale record.",
  },
  {
    method: "GET",
    path: "/v1/retail-point-of-sale/get-sale",
    permission: "retail.pos.read",
    description: "Retrieve a sale by id.",
  },
];
