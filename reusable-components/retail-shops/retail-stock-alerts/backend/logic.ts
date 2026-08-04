/**
 * Business logic for the retail-stock-alerts component.
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
  StockAlert,
} from "./types";

import {
  type EvaluateStockLevelInput,
  validateEvaluateStockLevelInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailStockAlertsStore {
  getStockAlert(tenantId: string, id: EntityId): StockAlert | undefined;
  putStockAlert(tenantId: string, entity: StockAlert): void;
  listStockAlerts(tenantId: string): readonly StockAlert[];
  deleteStockAlert(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailStockAlertsStore implements RetailStockAlertsStore {
  private readonly stockAlerts = new Map<string, Map<string, StockAlert>>();

  getStockAlert(tenantId: string, id: EntityId): StockAlert | undefined {
    return this.stockAlerts.get(tenantId)?.get(id);
  }
  putStockAlert(tenantId: string, entity: StockAlert): void {
    let byId = this.stockAlerts.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.stockAlerts.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listStockAlerts(tenantId: string): readonly StockAlert[] {
    const byId = this.stockAlerts.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteStockAlert(tenantId: string, id: EntityId): boolean {
    return this.stockAlerts.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailStockAlertsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly suppressDuplicateHours: number;
  readonly alertRecipientRole: string;
}

//////////////////////////////////////////////////////////////////////
// evaluateStockLevel — Evaluate a single product's stock level and emit an alert if it has crossed a threshold. Suppresses duplicates within the configured window.
//////////////////////////////////////////////////////////////////////
export function evaluateStockLevel(
  ctx: TenantContext,
  deps: Dependencies,
  input: EvaluateStockLevelInput
): Result<StockAlert | null> {
  deps.permissions.require(ctx, asPermission("retail.stockalerts.evaluate"));
  const validated = validateEvaluateStockLevelInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    let alertType: "low_stock" | "out_of_stock" | null = null;
    if (v.currentQuantity === 0) {
      alertType = "out_of_stock";
    } else if (v.currentQuantity < v.threshold) {
      alertType = "low_stock";
    }
    if (!alertType) {
      return ok(null);
    }
    // Suppress duplicates within the window.
    const recent = deps.store.listStockAlerts(ctx.tenantId)
      .filter(
        (a) =>
          a.productId === v.productId &&
          a.alertType === alertType &&
          Date.now() - new Date(a.createdAt).getTime() < deps.config.suppressDuplicateHours * 3600 * 1000
      );
    if (recent.length > 0) {
      return ok(null);
    }
    const id = asEntityId("alert_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const alert: StockAlert = {
      id,
      tenantId: ctx.tenantId,
      productId: v.productId,
      alertType,
      currentQuantity: v.currentQuantity,
      threshold: alertType === "out_of_stock" ? 0 : v.threshold,
      notificationId: null,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putStockAlert(ctx.tenantId, alert);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-stock-alerts",
      action: "retail.stockalert.emitted",
      entityType: "stock_alert",
      entityId: id,
      details: { productId: v.productId, alertType, currentQuantity: v.currentQuantity, threshold: alert.threshold },
    }));
    return ok(alert);
}

//////////////////////////////////////////////////////////////////////
// listActiveAlerts — List all alerts emitted in the last 24 hours, newest first.
//////////////////////////////////////////////////////////////////////
export function listActiveAlerts(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly StockAlert[]> {
  deps.permissions.require(ctx, asPermission("retail.stockalerts.read"));
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const all = deps.store.listStockAlerts(ctx.tenantId);
    const filtered = all.filter((a) => a.createdAt >= cutoff);
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(filtered);
}
