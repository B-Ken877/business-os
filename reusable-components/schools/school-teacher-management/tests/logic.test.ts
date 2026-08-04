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
  InMemorySchoolTeacherManagementStore,
  createTeacher,
  listTeachers,
  defaultConfig,
  type Teacher,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolTeacherManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.teachers.manage",
    "school.teachers.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-teacher-management / createTeacher", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createTeacher(ctx, denyDeps, { firstName: "value", lastName: "value", email: undefined, phone: undefined, subjectsJson: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-teacher-management / listTeachers", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listTeachers(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-teacher-management / create happy path", () => {
  it("creates and lists teachers", () => {
    const { ctx, deps } = setup();
    createTeacher(ctx, deps, { firstName: "Marie", lastName: "Joseph", subjectsJson: JSON.stringify(["Math", "Science"]) });
    createTeacher(ctx, deps, { firstName: "Jean", lastName: "Pierre" });
    const r = listTeachers(ctx, deps);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(2);
  });
  it("rejects malformed subjectsJson", () => {
    const { ctx, deps } = setup();
    const r = createTeacher(ctx, deps, { firstName: "X", lastName: "Y", subjectsJson: "not json" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
