import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryRestaurantIngredientTrackingStore,
  addIngredientStock,
  depleteForMenuItem,
  defaultConfig,
  type Ingredient,
  type Recipe,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantIngredientTrackingStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.ingredients.manage",
    "restaurant.ingredients.read",
    "restaurant.recipes.manage",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-ingredient-tracking / addIngredientStock", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      addIngredientStock(ctx, denyDeps, { ingredientId: "ent_test", quantityAdded: 1 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-ingredient-tracking / depleteForMenuItem", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      depleteForMenuItem(ctx, denyDeps, { menuItemIngredientKey: "value", quantitySold: 1 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-ingredient-tracking / deplete rules", () => {
  it("depletes ingredients per the recipe", () => {
    const { ctx, deps } = setup();
    // Seed an ingredient and a recipe.
    const ing: any = {
      id: "ent_i1" as any, tenantId: ctx.tenantId as any,
      name: "Flour", unit: "kg", quantity: 10, lowThreshold: 2,
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putIngredient(ctx.tenantId, ing);
    const recipe: any = {
      id: "ent_r1" as any, tenantId: ctx.tenantId as any,
      menuItemIngredientKey: "item-1",
      ingredientsJson: JSON.stringify([{ ingredientId: "ent_i1", quantityUsed: 2 }]),
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putRecipe(ctx.tenantId, recipe);
    const r = depleteForMenuItem(ctx, deps, { menuItemIngredientKey: "item-1", quantitySold: 3 });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value[0].quantity).toBe(4);  // 10 - 2*3 = 4
  });
  it("rejects depletion when stock is insufficient", () => {
    const { ctx, deps } = setup();
    const ing: any = {
      id: "ent_i1" as any, tenantId: ctx.tenantId as any,
      name: "Flour", unit: "kg", quantity: 5, lowThreshold: 2,
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putIngredient(ctx.tenantId, ing);
    const recipe: any = {
      id: "ent_r1" as any, tenantId: ctx.tenantId as any,
      menuItemIngredientKey: "item-1",
      ingredientsJson: JSON.stringify([{ ingredientId: "ent_i1", quantityUsed: 2 }]),
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putRecipe(ctx.tenantId, recipe);
    const r = depleteForMenuItem(ctx, deps, { menuItemIngredientKey: "item-1", quantitySold: 3 });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
