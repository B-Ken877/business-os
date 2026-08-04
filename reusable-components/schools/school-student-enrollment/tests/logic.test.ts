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
  InMemorySchoolStudentEnrollmentStore,
  enrollStudent,
  updateEnrollmentStatus,
  defaultConfig,
  type Student,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolStudentEnrollmentStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.students.create",
    "school.students.update",
    "school.students.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-student-enrollment / enrollStudent", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      enrollStudent(ctx, denyDeps, { firstName: "value", lastName: "value", dateOfBirth: "2024-01-15", guardianName: "value", guardianPhone: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-student-enrollment / updateEnrollmentStatus", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      updateEnrollmentStatus(ctx, denyDeps, { studentId: "ent_test", newStatus: "applicant" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-student-enrollment / enrollment state machine", () => {
  it("enrolls a student and transitions through the lifecycle", () => {
    const { ctx, deps } = setup();
    const s = enrollStudent(ctx, deps, {
      firstName: "Jean", lastName: "Baptiste", dateOfBirth: "2010-05-15",
      guardianName: "Marie Baptiste", guardianPhone: "+509 1234",
    });
    expect(isOk(s)).toBe(true);
    if (!s.ok) return;
    expect(s.value.enrollmentStatus).toBe("enrolled");
    const g = updateEnrollmentStatus(ctx, deps, { studentId: s.value.id, newStatus: "graduated" });
    expect(isOk(g)).toBe(true);
  });
  it("rejects invalid transitions", () => {
    const { ctx, deps } = setup();
    const s = enrollStudent(ctx, deps, {
      firstName: "J", lastName: "B", dateOfBirth: "2010-05-15", guardianName: "M",
    });
    if (!s.ok) throw new Error("setup failed");
    // Cannot go from enrolled back to applicant.
    const r = updateEnrollmentStatus(ctx, deps, { studentId: s.value.id, newStatus: "applicant" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
  it("rejects no-op status updates", () => {
    const { ctx, deps } = setup();
    const s = enrollStudent(ctx, deps, {
      firstName: "J", lastName: "B", dateOfBirth: "2010-05-15", guardianName: "M",
    });
    if (!s.ok) throw new Error("setup failed");
    const r = updateEnrollmentStatus(ctx, deps, { studentId: s.value.id, newStatus: "enrolled" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
