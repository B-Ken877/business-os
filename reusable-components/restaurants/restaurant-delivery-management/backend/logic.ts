/**
 * Business logic for the restaurant-delivery-management component.
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
  Delivery,
} from "./types";

import {
  type AssignDriverInput,
  validateAssignDriverInput,
  type ConfirmDeliveredInput,
  validateConfirmDeliveredInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantDeliveryManagementStore {
  getDelivery(tenantId: string, id: EntityId): Delivery | undefined;
  putDelivery(tenantId: string, entity: Delivery): void;
  listDeliverys(tenantId: string): readonly Delivery[];
  deleteDelivery(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantDeliveryManagementStore implements RestaurantDeliveryManagementStore {
  private readonly deliverys = new Map<string, Map<string, Delivery>>();

  getDelivery(tenantId: string, id: EntityId): Delivery | undefined {
    return this.deliverys.get(tenantId)?.get(id);
  }
  putDelivery(tenantId: string, entity: Delivery): void {
    let byId = this.deliverys.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.deliverys.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listDeliverys(tenantId: string): readonly Delivery[] {
    const byId = this.deliverys.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteDelivery(tenantId: string, id: EntityId): boolean {
    return this.deliverys.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantDeliveryManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxActiveDeliveriesPerDriver: number;
}

//////////////////////////////////////////////////////////////////////
// assignDriver — Assign a driver to a delivery.
//////////////////////////////////////////////////////////////////////
export function assignDriver(
  ctx: TenantContext,
  deps: Dependencies,
  input: AssignDriverInput
): Result<Delivery> {
  deps.permissions.require(ctx, asPermission("restaurant.delivery.assign"));
  const validated = validateAssignDriverInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.deliveryId);
    const existing = deps.store.getDelivery(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "delivery not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.driverId !== null) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "delivery already has a driver");
    }
    // Cap check.
    const activeForDriver = deps.store.listDeliverys(ctx.tenantId)
      .filter((d) => d.driverId === v.driverId && d.status !== "delivered").length;
    if (activeForDriver >= deps.config.maxActiveDeliveriesPerDriver) {
      return err(ErrorCode.LIMIT_EXCEEDED, "driver at max active deliveries");
    }
    const updated: Delivery = {
      ...existing, driverId: v.driverId, status: "assigned",
      updatedAt: new Date().toISOString(),
    };
    deps.store.putDelivery(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-delivery-management",
      action: "restaurant.delivery.driver_assigned", entityType: "delivery", entityId: id,
      details: { driverId: v.driverId },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// confirmDelivered — Confirm a delivery was completed.
//////////////////////////////////////////////////////////////////////
export function confirmDelivered(
  ctx: TenantContext,
  deps: Dependencies,
  input: ConfirmDeliveredInput
): Result<Delivery> {
  deps.permissions.require(ctx, asPermission("restaurant.delivery.update"));
  const validated = validateConfirmDeliveredInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.deliveryId);
    const existing = deps.store.getDelivery(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "delivery not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === "delivered") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "delivery already completed");
    }
    if (!existing.driverId) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "delivery has no driver assigned");
    }
    const updated: Delivery = {
      ...existing, status: "delivered", deliveredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deps.store.putDelivery(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-delivery-management",
      action: "restaurant.delivery.delivered", entityType: "delivery", entityId: id, details: {},
    }));
    return ok(updated);
}
