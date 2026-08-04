/**
 * HTTP-shaped API contract for service-invoicing.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Invoice } from "../backend/types";
import type { GenerateInvoiceInput, MarkPaidInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/service-invoicing/generate-invoice",
    permission: "service.invoicing.generate",
    description: "Generate an invoice.",
  },
  {
    method: "PATCH",
    path: "/v1/service-invoicing/mark-paid",
    permission: "service.invoicing.record_payment",
    description: "Mark an invoice as paid.",
  },
];
