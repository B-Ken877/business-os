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
  InMemoryRetailProductCatalogStore,
  createProduct,
  updatePrice,
  archiveProduct,
  defaultConfig,
  type Category,
  type Product,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRetailProductCatalogStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "retail.products.create",
    "retail.products.update",
    "retail.products.archive",
    "retail.products.read",
    "retail.categories.manage",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("retail-product-catalog / createProduct", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createProduct(ctx, denyDeps, { name: "value", sku: "value", categoryId: "ent_test", priceCents: 0, currency: "value", description: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-product-catalog / updatePrice", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      updatePrice(ctx, denyDeps, { productId: "ent_test", newPriceCents: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-product-catalog / archiveProduct", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      archiveProduct(ctx, denyDeps, { productId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-product-catalog / createProduct happy path", () => {
  it("creates a product and rejects duplicate SKUs", () => {
    const { ctx, deps } = setup();
    // First, create a category.
    const cat: any = {
      id: "ent_cat1" as any,
      tenantId: ctx.tenantId as any,
      name: "Beverages",
      description: "",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putCategory(ctx.tenantId, cat);
    const r = createProduct(ctx, deps, {
      name: "Coke 500ml",
      sku: "BVG-COKE-500",
      categoryId: "ent_cat1",
      priceCents: 5000,
      currency: "HTG",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("active");
    // Duplicate SKU.
    const r2 = createProduct(ctx, deps, {
      name: "Coke 500ml v2",
      sku: "BVG-COKE-500",
      categoryId: "ent_cat1",
      priceCents: 5000,
      currency: "HTG",
    });
    expect(isErr(r2)).toBe(true);
    if (!r2.ok) expect(r2.error.code).toBe("CONFLICT");
  });

  it("rejects products with non-existent categories", () => {
    const { ctx, deps } = setup();
    const r = createProduct(ctx, deps, {
      name: "Pepsi",
      sku: "BVG-PEPSI-500",
      categoryId: "ent_missing",
      priceCents: 5000,
      currency: "HTG",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });
});

describe("retail-product-catalog / updatePrice rules", () => {
  it("updates the price and records the previous in audit", () => {
    const { ctx, deps, audit } = setup();
    const cat: any = {
      id: "ent_cat1" as any, tenantId: ctx.tenantId as any,
      name: "Beverages", description: "",
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putCategory(ctx.tenantId, cat);
    const p = createProduct(ctx, deps, {
      name: "Coke", sku: "C1", categoryId: "ent_cat1",
      priceCents: 5000, currency: "HTG",
    });
    if (!p.ok) throw new Error("setup failed");
    const r = updatePrice(ctx, deps, { productId: p.value.id, newPriceCents: 5500 });
    expect(isOk(r)).toBe(true);
    const entries = audit.filter((e) => e.action === "retail.product.price_updated");
    expect(entries).toHaveLength(1);
    expect(entries[0].details?.previousPriceCents).toBe(5000);
    expect(entries[0].details?.newPriceCents).toBe(5500);
  });

  it("rejects no-op price updates", () => {
    const { ctx, deps } = setup();
    const cat: any = {
      id: "ent_cat1" as any, tenantId: ctx.tenantId as any,
      name: "Beverages", description: "",
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putCategory(ctx.tenantId, cat);
    const p = createProduct(ctx, deps, {
      name: "Coke", sku: "C1", categoryId: "ent_cat1",
      priceCents: 5000, currency: "HTG",
    });
    if (!p.ok) throw new Error("setup failed");
    const r = updatePrice(ctx, deps, { productId: p.value.id, newPriceCents: 5000 });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
