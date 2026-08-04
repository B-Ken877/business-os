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
  InMemorySchoolStudentPortalStore,
  startSession,
  endSession,
  defaultConfig,
  type StudentPortalSession,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolStudentPortalStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.portal.student.view",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-student-portal / startSession", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      startSession(ctx, denyDeps, { studentId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-student-portal / endSession", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      endSession(ctx, denyDeps, { sessionId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-student-portal / session lifecycle", () => {
  it("starts and ends a session", () => {
    const { ctx, deps } = setup();
    const s = startSession(ctx, deps, { studentId: "ent_s1" });
    expect(isOk(s)).toBe(true);
    if (!s.ok) return;
    expect(s.value.status).toBe("active");
    const e = endSession(ctx, deps, { sessionId: s.value.id });
    expect(isOk(e)).toBe(true);
    if (!e.ok) return;
    expect(e.value.status).toBe("ended");
  });
  it("rejects ending an already-ended session", () => {
    const { ctx, deps } = setup();
    const s = startSession(ctx, deps, { studentId: "ent_s1" });
    if (!s.ok) throw new Error("setup failed");
    endSession(ctx, deps, { sessionId: s.value.id });
    const r = endSession(ctx, deps, { sessionId: s.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
