/**
 * Business logic for the restaurant-kitchen-display component.
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
  KitchenTicket,
} from "./types";

import {
  type CreateTicketInput,
  validateCreateTicketInput,
  type MarkTicketReadyInput,
  validateMarkTicketReadyInput,
  type ListTicketsForStationInput,
  validateListTicketsForStationInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantKitchenDisplayStore {
  getKitchenTicket(tenantId: string, id: EntityId): KitchenTicket | undefined;
  putKitchenTicket(tenantId: string, entity: KitchenTicket): void;
  listKitchenTickets(tenantId: string): readonly KitchenTicket[];
  deleteKitchenTicket(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantKitchenDisplayStore implements RestaurantKitchenDisplayStore {
  private readonly kitchenTickets = new Map<string, Map<string, KitchenTicket>>();

  getKitchenTicket(tenantId: string, id: EntityId): KitchenTicket | undefined {
    return this.kitchenTickets.get(tenantId)?.get(id);
  }
  putKitchenTicket(tenantId: string, entity: KitchenTicket): void {
    let byId = this.kitchenTickets.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.kitchenTickets.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listKitchenTickets(tenantId: string): readonly KitchenTicket[] {
    const byId = this.kitchenTickets.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteKitchenTicket(tenantId: string, id: EntityId): boolean {
    return this.kitchenTickets.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantKitchenDisplayStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxTicketsPerStation: number;
}

//////////////////////////////////////////////////////////////////////
// createTicket — Create a kitchen ticket from an order.
//////////////////////////////////////////////////////////////////////
export function createTicket(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateTicketInput
): Result<KitchenTicket> {
  deps.permissions.require(ctx, asPermission("restaurant.kitchen.tickets.update"));
  const validated = validateCreateTicketInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("kt_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const ticket: KitchenTicket = {
      id, tenantId: ctx.tenantId, orderId: v.orderId, itemsJson: v.itemsJson,
      station: v.station, priority: v.priority, status: "queued",
      createdAt: now, updatedAt: now,
    };
    deps.store.putKitchenTicket(ctx.tenantId, ticket);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-kitchen-display",
      action: "restaurant.kitchen.ticket_created", entityType: "kitchen_ticket", entityId: id,
      details: { orderId: v.orderId, station: v.station, priority: v.priority },
    }));
    return ok(ticket);
}

//////////////////////////////////////////////////////////////////////
// markTicketReady — Mark a kitchen ticket as ready for pickup.
//////////////////////////////////////////////////////////////////////
export function markTicketReady(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkTicketReadyInput
): Result<KitchenTicket> {
  deps.permissions.require(ctx, asPermission("restaurant.kitchen.tickets.update"));
  const validated = validateMarkTicketReadyInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.ticketId);
    const existing = deps.store.getKitchenTicket(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "ticket not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "queued" && existing.status !== "in_prep") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, `cannot mark ${existing.status} ticket as ready`);
    }
    const updated: KitchenTicket = {
      ...existing, status: "ready", updatedAt: new Date().toISOString(),
    };
    deps.store.putKitchenTicket(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-kitchen-display",
      action: "restaurant.kitchen.ticket_ready", entityType: "kitchen_ticket", entityId: id, details: {},
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// listTicketsForStation — List open tickets for a station, sorted by priority then placement time.
//////////////////////////////////////////////////////////////////////
export function listTicketsForStation(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListTicketsForStationInput
): Result<readonly KitchenTicket[]> {
  deps.permissions.require(ctx, asPermission("restaurant.kitchen.tickets.read"));
  const validated = validateListTicketsForStationInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listKitchenTickets(ctx.tenantId);
    const filtered = all.filter((t) => t.station === v.station && t.status !== "ready" && t.status !== "picked_up");
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.createdAt.localeCompare(b.createdAt);
    });
    return ok(filtered);
}
