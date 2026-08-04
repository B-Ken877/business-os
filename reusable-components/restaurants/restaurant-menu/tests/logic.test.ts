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
  InMemoryRestaurantMenuStore,
  createMenuItem,
  setAvailability,
  defaultConfig,
  type MenuItem,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantMenuStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.menu.items.manage",
    "restaurant.menu.items.read",
    "restaurant.menu.availability.manage",
    "restaurant.menu.categories.manage",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-menu / createMenuItem", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createMenuItem(ctx, denyDeps, { name: "value", categoryId: "ent_test", priceCents: 0, currency: "value", description: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-menu / setAvailability", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      setAvailability(ctx, denyDeps, { itemId: "ent_test", available: false });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-menu / createMenuItem happy path", () => {
  it("creates an available menu item", () => {
    const { ctx, deps } = setup();
    const r = createMenuItem(ctx, deps, {
      name: "Griot",
      categoryId: "ent_cat1",
      priceCents: 7500,
      currency: "HTG",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.available).toBe(true);
  });
});

describe("restaurant-menu / setAvailability rules", () => {
  it("86s an available item", () => {
    const { ctx, deps } = setup();
    const item = createMenuItem(ctx, deps, {
      name: "Griot", categoryId: "ent_cat1", priceCents: 7500, currency: "HTG",
    });
    if (!item.ok) throw new Error("setup failed");
    const r = setAvailability(ctx, deps, { itemId: item.value.id, available: false });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.available).toBe(false);
  });
  it("rejects no-op availability updates", () => {
    const { ctx, deps } = setup();
    const item = createMenuItem(ctx, deps, {
      name: "Griot", categoryId: "ent_cat1", priceCents: 7500, currency: "HTG",
    });
    if (!item.ok) throw new Error("setup failed");
    const r = setAvailability(ctx, deps, { itemId: item.value.id, available: true });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
