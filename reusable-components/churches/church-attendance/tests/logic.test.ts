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
  InMemoryChurchAttendanceStore,
  recordAttendance,
  isDeclining,
  defaultConfig,
  type ServiceAttendance,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryChurchAttendanceStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "church.attendance.record",
    "church.attendance.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("church-attendance / recordAttendance", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordAttendance(ctx, denyDeps, { memberId: "value", serviceDate: "2024-01-15", attended: false });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-attendance / isDeclining", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      isDeclining(ctx, denyDeps, { memberId: "value", asOfDate: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-attendance / decline detection", () => {
  it("flags a member as declining after N consecutive absences", () => {
    const { ctx, deps } = setup();
    // 3 consecutive absences.
    recordAttendance(ctx, deps, { memberId: "ent_m1", serviceDate: "2024-01-01", attended: false });
    recordAttendance(ctx, deps, { memberId: "ent_m1", serviceDate: "2024-01-08", attended: false });
    recordAttendance(ctx, deps, { memberId: "ent_m1", serviceDate: "2024-01-15", attended: false });
    const r = isDeclining(ctx, deps, { memberId: "ent_m1", asOfDate: "2024-01-15" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.consecutiveAbsences).toBe(3);
    expect(r.value.declining).toBe(true);  // threshold is 3
  });
  it("resets the absence counter on attendance", () => {
    const { ctx, deps } = setup();
    recordAttendance(ctx, deps, { memberId: "ent_m1", serviceDate: "2024-01-01", attended: false });
    recordAttendance(ctx, deps, { memberId: "ent_m1", serviceDate: "2024-01-08", attended: false });
    recordAttendance(ctx, deps, { memberId: "ent_m1", serviceDate: "2024-01-15", attended: true });
    const r = isDeclining(ctx, deps, { memberId: "ent_m1", asOfDate: "2024-01-15" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.consecutiveAbsences).toBe(0);
    expect(r.value.declining).toBe(false);
  });
});
