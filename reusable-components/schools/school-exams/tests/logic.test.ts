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
  InMemorySchoolExamsStore,
  createExam,
  markExamGraded,
  defaultConfig,
  type Exam,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolExamsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.exams.manage",
    "school.exams.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-exams / createExam", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createExam(ctx, denyDeps, { name: "value", period: "value", startsAt: "2024-01-15", endsAt: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-exams / markExamGraded", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markExamGraded(ctx, denyDeps, { examId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-exams / create + grade rules", () => {
  it("creates and grades an exam", () => {
    const { ctx, deps } = setup();
    const e = createExam(ctx, deps, {
      name: "Q2 Midterm", period: "Q2 2024", startsAt: "2024-12-01", endsAt: "2024-12-08",
    });
    expect(isOk(e)).toBe(true);
    if (!e.ok) return;
    expect(e.value.status).toBe("scheduled");
    const r = markExamGraded(ctx, deps, { examId: e.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("graded");
  });
  it("rejects re-grading an already-graded exam", () => {
    const { ctx, deps } = setup();
    const e = createExam(ctx, deps, {
      name: "X", period: "P", startsAt: "2024-12-01", endsAt: "2024-12-08",
    });
    if (!e.ok) throw new Error("setup failed");
    markExamGraded(ctx, deps, { examId: e.value.id });
    const r = markExamGraded(ctx, deps, { examId: e.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
