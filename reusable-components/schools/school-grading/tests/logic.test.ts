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
  InMemorySchoolGradingStore,
  recordGrade,
  computeStudentAverage,
  defaultConfig,
  type Grade,
  type Assessment,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolGradingStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.grades.record",
    "school.grades.read",
    "school.grades.manage_assessments",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-grading / recordGrade", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordGrade(ctx, denyDeps, { studentId: "ent_test", assessmentId: "ent_test", scorePct: 0, notes: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-grading / computeStudentAverage", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      computeStudentAverage(ctx, denyDeps, { studentId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-grading / record + compute rules", () => {
  it("records grades and computes the average", () => {
    const { ctx, deps } = setup();
    recordGrade(ctx, deps, { studentId: "ent_s1", assessmentId: "ent_a1", scorePct: 80 });
    recordGrade(ctx, deps, { studentId: "ent_s1", assessmentId: "ent_a2", scorePct: 60 });
    recordGrade(ctx, deps, { studentId: "ent_s1", assessmentId: "ent_a3", scorePct: 100 });
    const r = computeStudentAverage(ctx, deps, { studentId: "ent_s1" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.averagePct).toBe(80);
    expect(r.value.isPassing).toBe(true);
    expect(r.value.assessmentCount).toBe(3);
  });
  it("rejects scores over 100", () => {
    const { ctx, deps } = setup();
    const r = recordGrade(ctx, deps, { studentId: "ent_s1", assessmentId: "ent_a1", scorePct: 110 });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
