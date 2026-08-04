/**
 * Business logic for the service-booking component.
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
  Booking,
} from "./types";

import {
  type CreateBookingInput,
  validateCreateBookingInput,
  type MarkCompletedInput,
  validateMarkCompletedInput,
  type MarkNoShowInput,
  validateMarkNoShowInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ServiceBookingStore {
  getBooking(tenantId: string, id: EntityId): Booking | undefined;
  putBooking(tenantId: string, entity: Booking): void;
  listBookings(tenantId: string): readonly Booking[];
  deleteBooking(tenantId: string, id: EntityId): boolean;
}

export class InMemoryServiceBookingStore implements ServiceBookingStore {
  private readonly bookings = new Map<string, Map<string, Booking>>();

  getBooking(tenantId: string, id: EntityId): Booking | undefined {
    return this.bookings.get(tenantId)?.get(id);
  }
  putBooking(tenantId: string, entity: Booking): void {
    let byId = this.bookings.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.bookings.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listBookings(tenantId: string): readonly Booking[] {
    const byId = this.bookings.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteBooking(tenantId: string, id: EntityId): boolean {
    return this.bookings.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ServiceBookingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly slotGranularityMinutes: number;
}

//////////////////////////////////////////////////////////////////////
// createBooking — Create a new booking. Detects staff scheduling conflicts.
//////////////////////////////////////////////////////////////////////
export function createBooking(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateBookingInput
): Result<Booking> {
  deps.permissions.require(ctx, asPermission("service.bookings.create"));
  const validated = validateCreateBookingInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Conflict detection.
    const start = new Date(v.scheduledAt).getTime();
    const end = start + v.durationMinutes * 60 * 1000;
    const all = deps.store.listBookings(ctx.tenantId);
    const conflict = all.some((b) => {
      if (b.staffUserId !== v.staffUserId) return false;
      if (b.status === "cancelled") return false;
      const bStart = new Date(b.scheduledAt).getTime();
      const bEnd = bStart + b.durationMinutes * 60 * 1000;
      return start < bEnd && end > bStart;
    });
    if (conflict) {
      return err(ErrorCode.CONFLICT, "staff has an overlapping booking");
    }
    const id = asEntityId("bk_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const booking: Booking = {
      id, tenantId: ctx.tenantId, customerId: v.customerId, serviceId: v.serviceId,
      staffUserId: v.staffUserId, scheduledAt: v.scheduledAt,
      durationMinutes: v.durationMinutes, status: "confirmed",
      createdAt: now, updatedAt: now,
    };
    deps.store.putBooking(ctx.tenantId, booking);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-booking",
      action: "service.booking.created", entityType: "booking", entityId: id,
      details: { customerId: v.customerId, serviceId: v.serviceId, scheduledAt: v.scheduledAt },
    }));
    return ok(booking);
}

//////////////////////////////////////////////////////////////////////
// markCompleted — Mark a booking as completed.
//////////////////////////////////////////////////////////////////////
export function markCompleted(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkCompletedInput
): Result<Booking> {
  deps.permissions.require(ctx, asPermission("service.bookings.update_status"));
  const validated = validateMarkCompletedInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.bookingId);
    const existing = deps.store.getBooking(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "booking not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "confirmed") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only confirmed bookings can be completed");
    }
    const updated: Booking = {
      ...existing, status: "completed", updatedAt: new Date().toISOString(),
    };
    deps.store.putBooking(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-booking",
      action: "service.booking.completed", entityType: "booking", entityId: id, details: {},
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// markNoShow — Mark a booking as a no-show.
//////////////////////////////////////////////////////////////////////
export function markNoShow(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkNoShowInput
): Result<Booking> {
  deps.permissions.require(ctx, asPermission("service.bookings.update_status"));
  const validated = validateMarkNoShowInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.bookingId);
    const existing = deps.store.getBooking(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "booking not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "confirmed") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only confirmed bookings can be marked no-show");
    }
    const updated: Booking = {
      ...existing, status: "no_show", updatedAt: new Date().toISOString(),
    };
    deps.store.putBooking(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-booking",
      action: "service.booking.no_show", entityType: "booking", entityId: id, details: {},
    }));
    return ok(updated);
}
