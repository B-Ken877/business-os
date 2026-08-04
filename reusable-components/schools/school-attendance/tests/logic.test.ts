import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemorySchoolAttendanceStore,
  recordAttendance,
  computeAttendanceRate,
  defaultConfig,
  type AttendanceRecord,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolAttendanceStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.attendance.record",
    "school.attendance.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-attendance / recordAttendance", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordAttendance(ctx, denyDeps, { studentId: "ent_test", sessionDate: "2024-01-15", status: "present", notes: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-attendance / computeAttendanceRate", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      computeAttendanceRate(ctx, denyDeps, { studentId: "ent_test", fromDate: "2024-01-15", toDate: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-attendance / record + compute rules", () => {
  it("records attendance and computes the absent rate", () => {
    const { ctx, deps } = setup();
    // 5 sessions, 1 absent.
    recordAttendance(ctx, deps, { studentId: "ent_s1", sessionDate: "2024-01-01", status: "present" });
    recordAttendance(ctx, deps, { studentId: "ent_s1", sessionDate: "2024-01-02", status: "absent" });
    recordAttendance(ctx, deps, { studentId: "ent_s1", sessionDate: "2024-01-03", status: "present" });
    recordAttendance(ctx, deps, { studentId: "ent_s1", sessionDate: "2024-01-04", status: "present" });
    recordAttendance(ctx, deps, { studentId: "ent_s1", sessionDate: "2024-01-05", status: "present" });
    const r = computeAttendanceRate(ctx, deps, {
      studentId: "ent_s1", fromDate: "2024-01-01", toDate: "2024-01-05",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.totalSessions).toBe(5);
    expect(r.value.absentSessions).toBe(1);
    expect(r.value.absentPct).toBe(20);
    expect(r.value.isChronic).toBe(false);  // exactly at threshold, not above
  });
  it("is idempotent on (studentId, sessionDate)", () => {
    const { ctx, deps } = setup();
    recordAttendance(ctx, deps, { studentId: "ent_s1", sessionDate: "2024-01-01", status: "present" });
    const r2 = recordAttendance(ctx, deps, { studentId: "ent_s1", sessionDate: "2024-01-01", status: "absent" });
    expect(isOk(r2)).toBe(true);
    if (!r2.ok) return;
    expect(r2.value.status).toBe("absent");  // updated, not duplicated
  });
});
