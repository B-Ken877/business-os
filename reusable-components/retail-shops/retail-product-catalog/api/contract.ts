/**
 * HTTP-shaped API contract for retail-product-catalog.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Category, Product } from "../backend/types";
import type { CreateProductInput, UpdatePriceInput, ArchiveProductInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/retail-product-catalog/create-product",
    permission: "retail.products.create",
    description: "Create a new product.",
  },
  {
    method: "PATCH",
    path: "/v1/retail-product-catalog/update-price",
    permission: "retail.products.update",
    description: "Update a product's price. Records the previous price in audit.",
  },
  {
    method: "POST",
    path: "/v1/retail-product-catalog/archive-product",
    permission: "retail.products.archive",
    description: "Archive a product so it no longer appears in the active catalog.",
  },
];
