/**
 * HTTP-shaped API contract for payments-or-collections.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Payment } from "../backend/types";
import type { RecordPaymentInput, RefundPaymentInput, ListPaymentsForInvoiceInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/payments-or-collections/record-payment",
    permission: "payments.record",
    description: "Record a payment received.",
  },
  {
    method: "POST",
    path: "/v1/payments-or-collections/refund-payment",
    permission: "payments.refund",
    description: "Mark a previously recorded payment as refunded. The actual refund is initiated through the payment provider; this records the result.",
  },
  {
    method: "GET",
    path: "/v1/payments-or-collections/list-payments-for-invoice",
    permission: "payments.read",
    description: "List all non-refunded payments attached to an invoice.",
  },
];
