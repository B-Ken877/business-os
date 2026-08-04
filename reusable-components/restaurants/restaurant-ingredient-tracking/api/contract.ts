/**
 * HTTP-shaped API contract for restaurant-ingredient-tracking.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Ingredient, Recipe } from "../backend/types";
import type { AddIngredientStockInput, DepleteForMenuItemInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-ingredient-tracking/add-ingredient-stock",
    permission: "restaurant.ingredients.manage",
    description: "Add quantity to an ingredient (restock).",
  },
  {
    method: "POST",
    path: "/v1/restaurant-ingredient-tracking/deplete-for-menu-item",
    permission: "restaurant.ingredients.manage",
    description: "Deplete ingredient quantities based on a recipe, when a menu item is sold. Quantities are in the smallest unit.",
  },
];
