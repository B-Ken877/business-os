/**
 * Business logic for the retail-product-catalog component.
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
  Category,
  Product,
} from "./types";

import {
  type CreateProductInput,
  validateCreateProductInput,
  type UpdatePriceInput,
  validateUpdatePriceInput,
  type ArchiveProductInput,
  validateArchiveProductInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailProductCatalogStore {
  getCategory(tenantId: string, id: EntityId): Category | undefined;
  putCategory(tenantId: string, entity: Category): void;
  listCategorys(tenantId: string): readonly Category[];
  deleteCategory(tenantId: string, id: EntityId): boolean;
  getProduct(tenantId: string, id: EntityId): Product | undefined;
  putProduct(tenantId: string, entity: Product): void;
  listProducts(tenantId: string): readonly Product[];
  deleteProduct(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailProductCatalogStore implements RetailProductCatalogStore {
  private readonly categorys = new Map<string, Map<string, Category>>();
  private readonly products = new Map<string, Map<string, Product>>();

  getCategory(tenantId: string, id: EntityId): Category | undefined {
    return this.categorys.get(tenantId)?.get(id);
  }
  putCategory(tenantId: string, entity: Category): void {
    let byId = this.categorys.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.categorys.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listCategorys(tenantId: string): readonly Category[] {
    const byId = this.categorys.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteCategory(tenantId: string, id: EntityId): boolean {
    return this.categorys.get(tenantId)?.delete(id) ?? false;
  }

  getProduct(tenantId: string, id: EntityId): Product | undefined {
    return this.products.get(tenantId)?.get(id);
  }
  putProduct(tenantId: string, entity: Product): void {
    let byId = this.products.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.products.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listProducts(tenantId: string): readonly Product[] {
    const byId = this.products.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteProduct(tenantId: string, id: EntityId): boolean {
    return this.products.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailProductCatalogStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxProductsPerTenant: number;
  readonly maxCategoriesPerTenant: number;
  readonly defaultCurrency: string;
}

//////////////////////////////////////////////////////////////////////
// createProduct — Create a new product.
//////////////////////////////////////////////////////////////////////
export function createProduct(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateProductInput
): Result<Product> {
  deps.permissions.require(ctx, asPermission("retail.products.create"));
  const validated = validateCreateProductInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // SKU uniqueness.
    const existing = deps.store.listProducts(ctx.tenantId);
    if (existing.some((p) => p.sku === v.sku)) {
      return err(ErrorCode.CONFLICT, "sku already exists");
    }
    // Category must exist.
    const category = deps.store.getCategory(ctx.tenantId, asEntityId(v.categoryId));
    if (!category) {
      return err(ErrorCode.NOT_FOUND, "category not found");
    }
    if (existing.length >= deps.config.maxProductsPerTenant) {
      return err(ErrorCode.LIMIT_EXCEEDED, "product limit reached");
    }
    const id = asEntityId("prod_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const product: Product = {
      id,
      tenantId: ctx.tenantId,
      name: v.name,
      sku: v.sku,
      categoryId: v.categoryId,
      priceCents: v.priceCents,
      currency: v.currency,
      description: v.description ?? "",
      photoDocumentId: null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putProduct(ctx.tenantId, product);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-product-catalog",
      action: "retail.product.created",
      entityType: "product",
      entityId: id,
      details: { name: v.name, sku: v.sku, priceCents: v.priceCents, currency: v.currency },
    }));
    return ok(product);
}

//////////////////////////////////////////////////////////////////////
// updatePrice — Update a product's price. Records the previous price in audit.
//////////////////////////////////////////////////////////////////////
export function updatePrice(
  ctx: TenantContext,
  deps: Dependencies,
  input: UpdatePriceInput
): Result<Product> {
  deps.permissions.require(ctx, asPermission("retail.products.update"));
  const validated = validateUpdatePriceInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.productId);
    const existing = deps.store.getProduct(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "product not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.priceCents === v.newPriceCents) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "new price equals current price");
    }
    const updated: Product = {
      ...existing,
      priceCents: v.newPriceCents,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putProduct(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-product-catalog",
      action: "retail.product.price_updated",
      entityType: "product",
      entityId: id,
      details: { previousPriceCents: existing.priceCents, newPriceCents: v.newPriceCents },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// archiveProduct — Archive a product so it no longer appears in the active catalog.
//////////////////////////////////////////////////////////////////////
export function archiveProduct(
  ctx: TenantContext,
  deps: Dependencies,
  input: ArchiveProductInput
): Result<Product> {
  deps.permissions.require(ctx, asPermission("retail.products.archive"));
  const validated = validateArchiveProductInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.productId);
    const existing = deps.store.getProduct(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "product not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === "archived") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "product already archived");
    }
    const updated: Product = {
      ...existing,
      status: "archived",
      updatedAt: new Date().toISOString(),
    };
    deps.store.putProduct(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-product-catalog",
      action: "retail.product.archived",
      entityType: "product",
      entityId: id,
      details: { name: existing.name, sku: existing.sku },
    }));
    return ok(updated);
}
