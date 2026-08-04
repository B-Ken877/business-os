/**
 * Business logic for the retail-inventory component.
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
  StockLevel,
  StockMovement,
} from "./types";

import {
  type AdjustStockInput,
  validateAdjustStockInput,
  type SetLowStockThresholdInput,
  validateSetLowStockThresholdInput,
  type ListMovementsForProductInput,
  validateListMovementsForProductInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailInventoryStore {
  getStockLevel(tenantId: string, id: EntityId): StockLevel | undefined;
  putStockLevel(tenantId: string, entity: StockLevel): void;
  listStockLevels(tenantId: string): readonly StockLevel[];
  deleteStockLevel(tenantId: string, id: EntityId): boolean;
  getStockMovement(tenantId: string, id: EntityId): StockMovement | undefined;
  putStockMovement(tenantId: string, entity: StockMovement): void;
  listStockMovements(tenantId: string): readonly StockMovement[];
  deleteStockMovement(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailInventoryStore implements RetailInventoryStore {
  private readonly stockLevels = new Map<string, Map<string, StockLevel>>();
  private readonly stockMovements = new Map<string, Map<string, StockMovement>>();

  getStockLevel(tenantId: string, id: EntityId): StockLevel | undefined {
    return this.stockLevels.get(tenantId)?.get(id);
  }
  putStockLevel(tenantId: string, entity: StockLevel): void {
    let byId = this.stockLevels.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.stockLevels.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listStockLevels(tenantId: string): readonly StockLevel[] {
    const byId = this.stockLevels.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteStockLevel(tenantId: string, id: EntityId): boolean {
    return this.stockLevels.get(tenantId)?.delete(id) ?? false;
  }

  getStockMovement(tenantId: string, id: EntityId): StockMovement | undefined {
    return this.stockMovements.get(tenantId)?.get(id);
  }
  putStockMovement(tenantId: string, entity: StockMovement): void {
    let byId = this.stockMovements.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.stockMovements.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listStockMovements(tenantId: string): readonly StockMovement[] {
    const byId = this.stockMovements.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteStockMovement(tenantId: string, id: EntityId): boolean {
    return this.stockMovements.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailInventoryStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultLowStockThreshold: number;
  readonly allowNegativeStock: boolean;
  readonly maxMovementsPerProduct: number;
}

//////////////////////////////////////////////////////////////////////
// adjustStock — Adjust stock by a delta (positive or negative). Records a movement.
//////////////////////////////////////////////////////////////////////
export function adjustStock(
  ctx: TenantContext,
  deps: Dependencies,
  input: AdjustStockInput
): Result<StockLevel> {
  deps.permissions.require(ctx, asPermission("retail.inventory.adjust"));
  const validated = validateAdjustStockInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.delta === 0) {
      return err(ErrorCode.INVALID_INPUT, "delta must be non-zero");
    }
    // Look up the existing level by productId (the store is keyed by entity id,
    // so we filter the list).
    let level = deps.store.listStockLevels(ctx.tenantId)
      .find((l) => l.productId === v.productId);
    if (!level) {
      // Auto-create a level with default threshold.
      level = {
        id: asEntityId("lvl_" + Math.random().toString(36).slice(2, 10)),
        tenantId: ctx.tenantId,
        productId: v.productId,
        quantity: 0,
        lowStockThreshold: deps.config.defaultLowStockThreshold,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const newQty = level.quantity + v.delta;
    if (newQty < 0 && !deps.config.allowNegativeStock) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "stock cannot go negative");
    }
    const updated: StockLevel = {
      ...level,
      quantity: newQty,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putStockLevel(ctx.tenantId, updated);
    // Record the movement.
    const movement: StockMovement = {
      id: asEntityId("mov_" + Math.random().toString(36).slice(2, 10)),
      tenantId: ctx.tenantId,
      productId: v.productId,
      delta: v.delta,
      reason: v.reason,
      reference: v.reference ?? null,
      createdAt: updated.updatedAt,
      updatedAt: updated.updatedAt,
    };
    deps.store.putStockMovement(ctx.tenantId, movement);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-inventory",
      action: "retail.stock.adjusted",
      entityType: "stock_level",
      entityId: updated.id,
      details: { productId: v.productId, delta: v.delta, previousQty: level.quantity, newQty, reason: v.reason },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// setLowStockThreshold — Set the low-stock threshold for a product.
//////////////////////////////////////////////////////////////////////
export function setLowStockThreshold(
  ctx: TenantContext,
  deps: Dependencies,
  input: SetLowStockThresholdInput
): Result<StockLevel> {
  deps.permissions.require(ctx, asPermission("retail.inventory.thresholds.manage"));
  const validated = validateSetLowStockThresholdInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    let level = deps.store.listStockLevels(ctx.tenantId)
      .find((l) => l.productId === v.productId);
    if (!level) {
      level = {
        id: asEntityId("lvl_" + Math.random().toString(36).slice(2, 10)),
        tenantId: ctx.tenantId,
        productId: v.productId,
        quantity: 0,
        lowStockThreshold: deps.config.defaultLowStockThreshold,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const updated: StockLevel = {
      ...level,
      lowStockThreshold: v.threshold,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putStockLevel(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-inventory",
      action: "retail.threshold.updated",
      entityType: "stock_level",
      entityId: updated.id,
      details: { productId: v.productId, threshold: v.threshold },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// listMovementsForProduct — List all stock movements for a product, newest first.
//////////////////////////////////////////////////////////////////////
export function listMovementsForProduct(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListMovementsForProductInput
): Result<readonly StockMovement[]> {
  deps.permissions.require(ctx, asPermission("retail.inventory.read"));
  const validated = validateListMovementsForProductInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listStockMovements(ctx.tenantId);
    const filtered = all.filter((m) => m.productId === v.productId);
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(filtered);
}
