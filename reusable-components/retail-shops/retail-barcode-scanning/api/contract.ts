/**
 * HTTP-shaped API contract for retail-barcode-scanning.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Barcode } from "../backend/types";
import type { RegisterBarcodeInput, LookupBarcodeInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/retail-barcode-scanning/register-barcode",
    permission: "retail.barcodes.register",
    description: "Register a barcode against a product. A barcode can be registered to at most one product per tenant.",
  },
  {
    method: "POST",
    path: "/v1/retail-barcode-scanning/lookup-barcode",
    permission: "retail.barcodes.lookup",
    description: "Resolve a scanned barcode string to a product. Returns NOT_FOUND if the barcode is not registered.",
  },
];
