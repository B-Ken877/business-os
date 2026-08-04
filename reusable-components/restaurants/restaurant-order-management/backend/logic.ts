/**
 * Business logic for the restaurant-order-management component.
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
  Order,
} from "./types";

import {
  type CreateOrderInput,
  validateCreateOrderInput,
  type AdvanceOrderStatusInput,
  validateAdvanceOrderStatusInput,
  type CancelOrderInput,
  validateCancelOrderInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantOrderManagementStore {
  getOrder(tenantId: string, id: EntityId): Order | undefined;
  putOrder(tenantId: string, entity: Order): void;
  listOrders(tenantId: string): readonly Order[];
  deleteOrder(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantOrderManagementStore implements RestaurantOrderManagementStore {
  private readonly orders = new Map<string, Map<string, Order>>();

  getOrder(tenantId: string, id: EntityId): Order | undefined {
    return this.orders.get(tenantId)?.get(id);
  }
  putOrder(tenantId: string, entity: Order): void {
    let byId = this.orders.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.orders.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listOrders(tenantId: string): readonly Order[] {
    const byId = this.orders.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteOrder(tenantId: string, id: EntityId): boolean {
    return this.orders.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantOrderManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxItemsPerOrder: number;
  readonly defaultFulfillmentType: string;
}

//////////////////////////////////////////////////////////////////////
// createOrder — Place a new order.
//////////////////////////////////////////////////////////////////////
export function createOrder(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateOrderInput
): Result<Order> {
  deps.permissions.require(ctx, asPermission("restaurant.orders.create"));
  const validated = validateCreateOrderInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    try {
      const parsed = JSON.parse(v.itemsJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return err(ErrorCode.INVALID_INPUT, "items must be a non-empty array");
      }
      if (parsed.length > deps.config.maxItemsPerOrder) {
        return err(ErrorCode.LIMIT_EXCEEDED, "too many items in order");
      }
    } catch {
      return err(ErrorCode.INVALID_INPUT, "itemsJson is not valid JSON");
    }
    if (v.fulfillmentType === "dine_in" && !v.tableId) {
      return err(ErrorCode.INVALID_INPUT, "tableId is required for dine_in orders");
    }
    if (v.fulfillmentType === "delivery" && !v.deliveryAddress) {
      return err(ErrorCode.INVALID_INPUT, "deliveryAddress is required for delivery orders");
    }
    const id = asEntityId("ord_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const order: Order = {
      id,
      tenantId: ctx.tenantId,
      itemsJson: v.itemsJson,
      fulfillmentType: v.fulfillmentType,
      tableId: v.tableId ?? null,
      deliveryAddress: v.deliveryAddress ?? null,
      specialInstructions: v.specialInstructions ?? null,
      status: "placed",
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putOrder(ctx.tenantId, order);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "restaurant-order-management",
      action: "restaurant.order.placed",
      entityType: "order",
      entityId: id,
      details: { fulfillmentType: v.fulfillmentType, itemsCount: JSON.parse(v.itemsJson).length },
    }));
    return ok(order);
}

//////////////////////////////////////////////////////////////////////
// advanceOrderStatus — Advance the order to the next status. Enforces the state machine.
//////////////////////////////////////////////////////////////////////
export function advanceOrderStatus(
  ctx: TenantContext,
  deps: Dependencies,
  input: AdvanceOrderStatusInput
): Result<Order> {
  deps.permissions.require(ctx, asPermission("restaurant.orders.update_status"));
  const validated = validateAdvanceOrderStatusInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.orderId);
    const existing = deps.store.getOrder(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "order not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    const transitions: Record<string, string> = {
      placed: "in_kitchen",
      in_kitchen: "ready",
      ready: "served",
      served: "served",  // terminal
      cancelled: "cancelled",  // terminal
    };
    const next = transitions[existing.status];
    if (!next || next === existing.status) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, `cannot advance from ${existing.status}`);
    }
    const updated: Order = {
      ...existing,
      status: next,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putOrder(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "restaurant-order-management",
      action: "restaurant.order.status_advanced",
      entityType: "order",
      entityId: id,
      details: { from: existing.status, to: next },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// cancelOrder — Cancel an order. Only allowed before it's served.
//////////////////////////////////////////////////////////////////////
export function cancelOrder(
  ctx: TenantContext,
  deps: Dependencies,
  input: CancelOrderInput
): Result<Order> {
  deps.permissions.require(ctx, asPermission("restaurant.orders.cancel"));
  const validated = validateCancelOrderInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.orderId);
    const existing = deps.store.getOrder(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "order not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === "served") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "cannot cancel a served order");
    }
    if (existing.status === "cancelled") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "order already cancelled");
    }
    const updated: Order = {
      ...existing,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };
    deps.store.putOrder(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "restaurant-order-management",
      action: "restaurant.order.cancelled",
      entityType: "order",
      entityId: id,
      details: { previousStatus: existing.status },
    }));
    return ok(updated);
}
