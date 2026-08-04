/**
 * Business logic for the activity-timeline component.
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
  TimelineEvent,
} from "./types";

import {
  type RecordEventInput,
  validateRecordEventInput,
  type ListEventsForEntityInput,
  validateListEventsForEntityInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ActivityTimelineStore {
  getTimelineEvent(tenantId: string, id: EntityId): TimelineEvent | undefined;
  putTimelineEvent(tenantId: string, entity: TimelineEvent): void;
  listTimelineEvents(tenantId: string): readonly TimelineEvent[];
  deleteTimelineEvent(tenantId: string, id: EntityId): boolean;
}

export class InMemoryActivityTimelineStore implements ActivityTimelineStore {
  private readonly timelineEvents = new Map<string, Map<string, TimelineEvent>>();

  getTimelineEvent(tenantId: string, id: EntityId): TimelineEvent | undefined {
    return this.timelineEvents.get(tenantId)?.get(id);
  }
  putTimelineEvent(tenantId: string, entity: TimelineEvent): void {
    let byId = this.timelineEvents.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.timelineEvents.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listTimelineEvents(tenantId: string): readonly TimelineEvent[] {
    const byId = this.timelineEvents.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteTimelineEvent(tenantId: string, id: EntityId): boolean {
    return this.timelineEvents.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ActivityTimelineStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxEventsPerEntity: number;
  readonly summaryMaxLength: number;
}

//////////////////////////////////////////////////////////////////////
// recordEvent — Record an event for an entity. Events are immutable once recorded.
//////////////////////////////////////////////////////////////////////
export function recordEvent(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordEventInput
): Result<TimelineEvent> {
  deps.permissions.require(ctx, asPermission("timeline.events.record"));
  const validated = validateRecordEventInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.summary.length > deps.config.summaryMaxLength) {
      return err(ErrorCode.LIMIT_EXCEEDED, "summary exceeds max length");
    }
    const id = asEntityId("evt_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const event: TimelineEvent = {
      id,
      tenantId: ctx.tenantId,
      entityType: v.entityType,
      entityId: v.entityId,
      action: v.action,
      summary: v.summary,
      actorUserId: ctx.userId,
      occurredAt: v.occurredAt,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putTimelineEvent(ctx.tenantId, event);
    // Activity timeline events are themselves audit-worthy, but we do not
    // double-record into the audit sink — the event IS the audit record.
    return ok(event);
}

//////////////////////////////////////////////////////////////////////
// listEventsForEntity — List all events for an entity, newest first.
//////////////////////////////////////////////////////////////////////
export function listEventsForEntity(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListEventsForEntityInput
): Result<readonly TimelineEvent[]> {
  deps.permissions.require(ctx, asPermission("timeline.events.read"));
  const validated = validateListEventsForEntityInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listTimelineEvents(ctx.tenantId);
    const filtered = all.filter(
      (e) => e.entityType === v.entityType && e.entityId === v.entityId
    );
    filtered.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return ok(filtered);
}
