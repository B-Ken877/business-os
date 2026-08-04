/**
 * Business logic for the restaurant-reservations component.
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
  Reservation,
} from "./types";

import {
  type CreateReservationInput,
  validateCreateReservationInput,
  type CancelReservationInput,
  validateCancelReservationInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantReservationsStore {
  getReservation(tenantId: string, id: EntityId): Reservation | undefined;
  putReservation(tenantId: string, entity: Reservation): void;
  listReservations(tenantId: string): readonly Reservation[];
  deleteReservation(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantReservationsStore implements RestaurantReservationsStore {
  private readonly reservations = new Map<string, Map<string, Reservation>>();

  getReservation(tenantId: string, id: EntityId): Reservation | undefined {
    return this.reservations.get(tenantId)?.get(id);
  }
  putReservation(tenantId: string, entity: Reservation): void {
    let byId = this.reservations.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.reservations.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listReservations(tenantId: string): readonly Reservation[] {
    const byId = this.reservations.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteReservation(tenantId: string, id: EntityId): boolean {
    return this.reservations.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantReservationsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxReservationsPerDay: number;
  readonly reminderLeadMinutes: number;
}

//////////////////////////////////////////////////////////////////////
// createReservation — Create a new reservation.
//////////////////////////////////////////////////////////////////////
export function createReservation(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateReservationInput
): Result<Reservation> {
  deps.permissions.require(ctx, asPermission("restaurant.reservations.create"));
  const validated = validateCreateReservationInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("res_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const r: Reservation = {
      id, tenantId: ctx.tenantId, customerName: v.customerName,
      customerPhone: v.customerPhone ?? null, partySize: v.partySize,
      scheduledAt: v.scheduledAt, tableId: null, status: "confirmed",
      createdAt: now, updatedAt: now,
    };
    deps.store.putReservation(ctx.tenantId, r);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-reservations",
      action: "restaurant.reservation.created", entityType: "reservation", entityId: id,
      details: { customerName: v.customerName, partySize: v.partySize, scheduledAt: v.scheduledAt },
    }));
    return ok(r);
}

//////////////////////////////////////////////////////////////////////
// cancelReservation — Cancel a reservation.
//////////////////////////////////////////////////////////////////////
export function cancelReservation(
  ctx: TenantContext,
  deps: Dependencies,
  input: CancelReservationInput
): Result<Reservation> {
  deps.permissions.require(ctx, asPermission("restaurant.reservations.cancel"));
  const validated = validateCancelReservationInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.reservationId);
    const existing = deps.store.getReservation(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "reservation not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === "cancelled") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "reservation already cancelled");
    }
    if (existing.status === "completed") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "cannot cancel a completed reservation");
    }
    const updated: Reservation = {
      ...existing, status: "cancelled", updatedAt: new Date().toISOString(),
    };
    deps.store.putReservation(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-reservations",
      action: "restaurant.reservation.cancelled", entityType: "reservation", entityId: id, details: {},
    }));
    return ok(updated);
}
