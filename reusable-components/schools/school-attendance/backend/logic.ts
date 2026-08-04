/**
 * Business logic for the school-attendance component.
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
  AttendanceRecord,
} from "./types";

import {
  type RecordAttendanceInput,
  validateRecordAttendanceInput,
  type ComputeAttendanceRateInput,
  validateComputeAttendanceRateInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolAttendanceStore {
  getAttendanceRecord(tenantId: string, id: EntityId): AttendanceRecord | undefined;
  putAttendanceRecord(tenantId: string, entity: AttendanceRecord): void;
  listAttendanceRecords(tenantId: string): readonly AttendanceRecord[];
  deleteAttendanceRecord(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolAttendanceStore implements SchoolAttendanceStore {
  private readonly attendanceRecords = new Map<string, Map<string, AttendanceRecord>>();

  getAttendanceRecord(tenantId: string, id: EntityId): AttendanceRecord | undefined {
    return this.attendanceRecords.get(tenantId)?.get(id);
  }
  putAttendanceRecord(tenantId: string, entity: AttendanceRecord): void {
    let byId = this.attendanceRecords.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.attendanceRecords.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listAttendanceRecords(tenantId: string): readonly AttendanceRecord[] {
    const byId = this.attendanceRecords.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteAttendanceRecord(tenantId: string, id: EntityId): boolean {
    return this.attendanceRecords.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolAttendanceStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly chronicAbsenceThresholdPct: number;
}

//////////////////////////////////////////////////////////////////////
// recordAttendance — Record a student's attendance for a session. Idempotent on (studentId, sessionDate).
//////////////////////////////////////////////////////////////////////
export function recordAttendance(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordAttendanceInput
): Result<AttendanceRecord> {
  deps.permissions.require(ctx, asPermission("school.attendance.record"));
  const validated = validateRecordAttendanceInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Idempotency: if a record exists for (studentId, sessionDate), update it.
    const existing = deps.store.listAttendanceRecords(ctx.tenantId)
      .find((r) => r.studentId === v.studentId && r.sessionDate === v.sessionDate);
    const id = existing?.id ?? asEntityId("att_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const record: AttendanceRecord = {
      id, tenantId: ctx.tenantId, studentId: v.studentId, sessionDate: v.sessionDate,
      status: v.status, notes: v.notes ?? null, createdAt: existing?.createdAt ?? now, updatedAt: now,
    };
    deps.store.putAttendanceRecord(ctx.tenantId, record);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-attendance",
      action: "school.attendance.recorded", entityType: "attendance_record", entityId: id,
      details: { studentId: v.studentId, sessionDate: v.sessionDate, status: v.status },
    }));
    return ok(record);
}

//////////////////////////////////////////////////////////////////////
// computeAttendanceRate — Compute a student's attendance rate over a date range. Returns absent percentage.
//////////////////////////////////////////////////////////////////////
export function computeAttendanceRate(
  ctx: TenantContext,
  deps: Dependencies,
  input: ComputeAttendanceRateInput
): Result<{ totalSessions: number; absentSessions: number; absentPct: number; isChronic: boolean }> {
  deps.permissions.require(ctx, asPermission("school.attendance.read"));
  const validated = validateComputeAttendanceRateInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.fromDate > v.toDate) {
      return err(ErrorCode.INVALID_INPUT, "fromDate must be <= toDate");
    }
    const all = deps.store.listAttendanceRecords(ctx.tenantId);
    const studentRecords = all.filter(
      (r) => r.studentId === v.studentId && r.sessionDate >= v.fromDate && r.sessionDate <= v.toDate
    );
    const totalSessions = studentRecords.length;
    const absentSessions = studentRecords.filter((r) => r.status === "absent").length;
    const absentPct = totalSessions > 0 ? (absentSessions / totalSessions) * 100 : 0;
    return ok({
      totalSessions, absentSessions, absentPct,
      isChronic: absentPct > deps.config.chronicAbsenceThresholdPct,
    });
}
