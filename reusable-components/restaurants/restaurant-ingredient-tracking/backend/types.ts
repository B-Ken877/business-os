/**
 * Domain types for the restaurant-ingredient-tracking component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Ingredient
//////////////////////////////////////////////////////////////////////
/** A raw ingredient. */
export interface Ingredient {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Ingredient name. */
  readonly name: string;
  /** Unit of measure (e.g. 'kg', 'L'). */
  readonly unit: string;
  /** Current quantity on hand. */
  readonly quantity: number;
  /** Threshold below which to alert. */
  readonly lowThreshold: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// Recipe
//////////////////////////////////////////////////////////////////////
/** A recipe mapping a menu item to ingredient quantities. */
export interface Recipe {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Composite key linking menu item to ingredients (e.g. 'item-1'). */
  readonly menuItemIngredientKey: string;
  /** JSON-serialised list of { ingredientId, quantityUsed }. */
  readonly ingredientsJson: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
