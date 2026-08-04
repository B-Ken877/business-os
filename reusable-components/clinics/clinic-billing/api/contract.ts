/**
 * HTTP-shaped API contract for clinic-billing.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Invoice } from "../backend/types";
import type { GenerateInvoiceInput, MarkInvoicePaidInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-billing/generate-invoice",
    permission: "clinic.billing.generate",
    description: "Generate an invoice for a patient visit.",
  },
  {
    method: "PATCH",
    path: "/v1/clinic-billing/mark-invoice-paid",
    permission: "clinic.billing.record_payment",
    description: "Mark an invoice as paid.",
  },
];
