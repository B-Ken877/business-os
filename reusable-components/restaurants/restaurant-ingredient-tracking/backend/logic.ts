/**
 * Business logic for the restaurant-ingredient-tracking component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  Ingredient,
  Recipe,
} from "./types";

import {
  type AddIngredientStockInput,
  validateAddIngredientStockInput,
  type DepleteForMenuItemInput,
  validateDepleteForMenuItemInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantIngredientTrackingStore {
  getIngredient(tenantId: string, id: EntityId): Ingredient | undefined;
  putIngredient(tenantId: string, entity: Ingredient): void;
  listIngredients(tenantId: string): readonly Ingredient[];
  deleteIngredient(tenantId: string, id: EntityId): boolean;
  getRecipe(tenantId: string, id: EntityId): Recipe | undefined;
  putRecipe(tenantId: string, entity: Recipe): void;
  listRecipes(tenantId: string): readonly Recipe[];
  deleteRecipe(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantIngredientTrackingStore implements RestaurantIngredientTrackingStore {
  private readonly ingredients = new Map<string, Map<string, Ingredient>>();
  private readonly recipes = new Map<string, Map<string, Recipe>>();

  getIngredient(tenantId: string, id: EntityId): Ingredient | undefined {
    return this.ingredients.get(tenantId)?.get(id);
  }
  putIngredient(tenantId: string, entity: Ingredient): void {
    let byId = this.ingredients.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.ingredients.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listIngredients(tenantId: string): readonly Ingredient[] {
    const byId = this.ingredients.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteIngredient(tenantId: string, id: EntityId): boolean {
    return this.ingredients.get(tenantId)?.delete(id) ?? false;
  }

  getRecipe(tenantId: string, id: EntityId): Recipe | undefined {
    return this.recipes.get(tenantId)?.get(id);
  }
  putRecipe(tenantId: string, entity: Recipe): void {
    let byId = this.recipes.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.recipes.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listRecipes(tenantId: string): readonly Recipe[] {
    const byId = this.recipes.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteRecipe(tenantId: string, id: EntityId): boolean {
    return this.recipes.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantIngredientTrackingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultLowIngredientThreshold: number;
}

//////////////////////////////////////////////////////////////////////
// addIngredientStock — Add quantity to an ingredient (restock).
//////////////////////////////////////////////////////////////////////
export function addIngredientStock(
  ctx: TenantContext,
  deps: Dependencies,
  input: AddIngredientStockInput
): Result<Ingredient> {
  deps.permissions.require(ctx, asPermission("restaurant.ingredients.manage"));
  const validated = validateAddIngredientStockInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.ingredientId);
    const existing = deps.store.getIngredient(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "ingredient not found");
    assertSameTenant(ctx, existing.tenantId);
    const updated: Ingredient = {
      ...existing, quantity: existing.quantity + v.quantityAdded,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putIngredient(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-ingredient-tracking",
      action: "restaurant.ingredient.restocked", entityType: "ingredient", entityId: id,
      details: { added: v.quantityAdded, newQuantity: updated.quantity },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// depleteForMenuItem — Deplete ingredient quantities based on a recipe, when a menu item is sold. Quantities are in the smallest unit.
//////////////////////////////////////////////////////////////////////
export function depleteForMenuItem(
  ctx: TenantContext,
  deps: Dependencies,
  input: DepleteForMenuItemInput
): Result<ReadonlyArray<Ingredient>> {
  deps.permissions.require(ctx, asPermission("restaurant.ingredients.manage"));
  const validated = validateDepleteForMenuItemInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const recipes = deps.store.listRecipes(ctx.tenantId);
    const recipe = recipes.find((r) => r.menuItemIngredientKey === v.menuItemIngredientKey);
    if (!recipe) return err(ErrorCode.NOT_FOUND, "recipe not found");
    let parsed: ReadonlyArray<{ ingredientId: string; quantityUsed: number }>;
    try {
      parsed = JSON.parse(recipe.ingredientsJson);
    } catch {
      return err(ErrorCode.DEPENDENCY_ERROR, "recipe has malformed ingredientsJson");
    }
    const updated: Ingredient[] = [];
    for (const line of parsed) {
      const ing = deps.store.getIngredient(ctx.tenantId, asEntityId(line.ingredientId));
      if (!ing) return err(ErrorCode.NOT_FOUND, `ingredient ${line.ingredientId} not found`);
      const needed = line.quantityUsed * v.quantitySold;
      if (ing.quantity < needed) {
        return err(ErrorCode.BUSINESS_RULE_VIOLATION, `insufficient ${ing.name}: have ${ing.quantity}, need ${needed}`);
      }
    }
    for (const line of parsed) {
      const ing = deps.store.getIngredient(ctx.tenantId, asEntityId(line.ingredientId))!;
      const needed = line.quantityUsed * v.quantitySold;
      const newIng: Ingredient = {
        ...ing, quantity: ing.quantity - needed, updatedAt: new Date().toISOString(),
      };
      deps.store.putIngredient(ctx.tenantId, newIng);
      updated.push(newIng);
    }
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-ingredient-tracking",
      action: "restaurant.ingredient.depleted", entityType: "ingredient", entityId: v.menuItemIngredientKey,
      details: { menuItemIngredientKey: v.menuItemIngredientKey, quantitySold: v.quantitySold, ingredientsAffected: updated.length },
    }));
    return ok(updated);
}
