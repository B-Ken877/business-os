/**
 * HTTP-shaped API contract for retail-supplier-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Supplier, PurchaseOrder } from "../backend/types";
import type { CreateSupplierInput, CreatePurchaseOrderInput, MarkPurchaseOrderReceivedInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/retail-supplier-management/create-supplier",
    permission: "retail.suppliers.manage",
    description: "Create a new supplier record.",
  },
  {
    method: "POST",
    path: "/v1/retail-supplier-management/create-purchase-order",
    permission: "retail.purchaseorders.create",
    description: "Create a new purchase order for a supplier.",
  },
  {
    method: "PATCH",
    path: "/v1/retail-supplier-management/mark-purchase-order-received",
    permission: "retail.purchaseorders.receive",
    description: "Mark a PO as received. The actual stock increment is delegated to retail-inventory.",
  },
];
