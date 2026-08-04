/**
 * Business logic for the church-events component.
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
  Event,
  EventRegistration,
} from "./types";

import {
  type CreateEventInput,
  validateCreateEventInput,
  type RegisterForMemberInput,
  validateRegisterForMemberInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ChurchEventsStore {
  getEvent(tenantId: string, id: EntityId): Event | undefined;
  putEvent(tenantId: string, entity: Event): void;
  listEvents(tenantId: string): readonly Event[];
  deleteEvent(tenantId: string, id: EntityId): boolean;
  getEventRegistration(tenantId: string, id: EntityId): EventRegistration | undefined;
  putEventRegistration(tenantId: string, entity: EventRegistration): void;
  listEventRegistrations(tenantId: string): readonly EventRegistration[];
  deleteEventRegistration(tenantId: string, id: EntityId): boolean;
}

export class InMemoryChurchEventsStore implements ChurchEventsStore {
  private readonly events = new Map<string, Map<string, Event>>();
  private readonly eventRegistrations = new Map<string, Map<string, EventRegistration>>();

  getEvent(tenantId: string, id: EntityId): Event | undefined {
    return this.events.get(tenantId)?.get(id);
  }
  putEvent(tenantId: string, entity: Event): void {
    let byId = this.events.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.events.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listEvents(tenantId: string): readonly Event[] {
    const byId = this.events.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteEvent(tenantId: string, id: EntityId): boolean {
    return this.events.get(tenantId)?.delete(id) ?? false;
  }

  getEventRegistration(tenantId: string, id: EntityId): EventRegistration | undefined {
    return this.eventRegistrations.get(tenantId)?.get(id);
  }
  putEventRegistration(tenantId: string, entity: EventRegistration): void {
    let byId = this.eventRegistrations.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.eventRegistrations.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listEventRegistrations(tenantId: string): readonly EventRegistration[] {
    const byId = this.eventRegistrations.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteEventRegistration(tenantId: string, id: EntityId): boolean {
    return this.eventRegistrations.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ChurchEventsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultCapacity: number;
  readonly allowOverRegistration: boolean;
}

//////////////////////////////////////////////////////////////////////
// createEvent — Create a new event.
//////////////////////////////////////////////////////////////////////
export function createEvent(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateEventInput
): Result<Event> {
  deps.permissions.require(ctx, asPermission("church.events.manage"));
  const validated = validateCreateEventInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.startsAt >= v.endsAt) {
      return err(ErrorCode.INVALID_INPUT, "startsAt must be before endsAt");
    }
    const id = asEntityId("evt_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const event: Event = {
      id, tenantId: ctx.tenantId, name: v.name, description: "",
      startsAt: v.startsAt, endsAt: v.endsAt, location: v.location ?? null,
      capacity: v.capacity, status: "scheduled", createdAt: now, updatedAt: now,
    };
    deps.store.putEvent(ctx.tenantId, event);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-events",
      action: "church.event.created", entityType: "event", entityId: id,
      details: { name: v.name, startsAt: v.startsAt },
    }));
    return ok(event);
}

//////////////////////////////////////////////////////////////////////
// registerForMember — Register a member for an event. Enforces capacity.
//////////////////////////////////////////////////////////////////////
export function registerForMember(
  ctx: TenantContext,
  deps: Dependencies,
  input: RegisterForMemberInput
): Result<EventRegistration> {
  deps.permissions.require(ctx, asPermission("church.events.register"));
  const validated = validateRegisterForMemberInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const event = deps.store.getEvent(ctx.tenantId, asEntityId(v.eventId));
    if (!event) return err(ErrorCode.NOT_FOUND, "event not found");
    assertSameTenant(ctx, event.tenantId);
    if (event.status !== "scheduled") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "event is not open for registration");
    }
    // Check for duplicate registration.
    const existing = deps.store.listEventRegistrations(ctx.tenantId)
      .find((r) => r.eventId === v.eventId && r.memberId === v.memberId);
    if (existing) {
      return err(ErrorCode.CONFLICT, "member already registered");
    }
    // Capacity check.
    if (event.capacity > 0 && !deps.config.allowOverRegistration) {
      const count = deps.store.listEventRegistrations(ctx.tenantId)
        .filter((r) => r.eventId === v.eventId).length;
      if (count >= event.capacity) {
        return err(ErrorCode.LIMIT_EXCEEDED, "event at capacity");
      }
    }
    const id = asEntityId("reg_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const registration: EventRegistration = {
      id, tenantId: ctx.tenantId, eventId: v.eventId, memberId: v.memberId,
      createdAt: now, updatedAt: now,
    };
    deps.store.putEventRegistration(ctx.tenantId, registration);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-events",
      action: "church.event.registered", entityType: "event_registration", entityId: id,
      details: { eventId: v.eventId, memberId: v.memberId },
    }));
    return ok(registration);
}
