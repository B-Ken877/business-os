/**
 * Business logic for the church-attendance component.
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
  ServiceAttendance,
} from "./types";

import {
  type RecordAttendanceInput,
  validateRecordAttendanceInput,
  type IsDecliningInput,
  validateIsDecliningInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ChurchAttendanceStore {
  getServiceAttendance(tenantId: string, id: EntityId): ServiceAttendance | undefined;
  putServiceAttendance(tenantId: string, entity: ServiceAttendance): void;
  listServiceAttendances(tenantId: string): readonly ServiceAttendance[];
  deleteServiceAttendance(tenantId: string, id: EntityId): boolean;
}

export class InMemoryChurchAttendanceStore implements ChurchAttendanceStore {
  private readonly serviceAttendances = new Map<string, Map<string, ServiceAttendance>>();

  getServiceAttendance(tenantId: string, id: EntityId): ServiceAttendance | undefined {
    return this.serviceAttendances.get(tenantId)?.get(id);
  }
  putServiceAttendance(tenantId: string, entity: ServiceAttendance): void {
    let byId = this.serviceAttendances.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.serviceAttendances.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listServiceAttendances(tenantId: string): readonly ServiceAttendance[] {
    const byId = this.serviceAttendances.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteServiceAttendance(tenantId: string, id: EntityId): boolean {
    return this.serviceAttendances.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ChurchAttendanceStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly declineThresholdWeeks: number;
}

//////////////////////////////////////////////////////////////////////
// recordAttendance — Record a member's attendance for a service. Idempotent on (memberId, serviceDate).
//////////////////////////////////////////////////////////////////////
export function recordAttendance(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordAttendanceInput
): Result<ServiceAttendance> {
  deps.permissions.require(ctx, asPermission("church.attendance.record"));
  const validated = validateRecordAttendanceInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const existing = deps.store.listServiceAttendances(ctx.tenantId)
      .find((a) => a.memberId === v.memberId && a.serviceDate === v.serviceDate);
    const id = existing?.id ?? asEntityId("sa_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const record: ServiceAttendance = {
      id, tenantId: ctx.tenantId, memberId: v.memberId, serviceDate: v.serviceDate,
      attended: v.attended, createdAt: existing?.createdAt ?? now, updatedAt: now,
    };
    deps.store.putServiceAttendance(ctx.tenantId, record);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-attendance",
      action: "church.attendance.recorded", entityType: "service_attendance", entityId: id,
      details: { memberId: v.memberId, serviceDate: v.serviceDate, attended: v.attended },
    }));
    return ok(record);
}

//////////////////////////////////////////////////////////////////////
// isDeclining — Check if a member has missed the last N consecutive services.
//////////////////////////////////////////////////////////////////////
export function isDeclining(
  ctx: TenantContext,
  deps: Dependencies,
  input: IsDecliningInput
): Result<{ declining: boolean; consecutiveAbsences: number }> {
  deps.permissions.require(ctx, asPermission("church.attendance.read"));
  const validated = validateIsDecliningInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const records = deps.store.listServiceAttendances(ctx.tenantId)
      .filter((a) => a.memberId === v.memberId && a.serviceDate <= v.asOfDate)
      .sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));
    let consecutiveAbsences = 0;
    for (const r of records) {
      if (!r.attended) consecutiveAbsences++;
      else break;
    }
    return ok({
      declining: consecutiveAbsences >= deps.config.declineThresholdWeeks,
      consecutiveAbsences,
    });
}
