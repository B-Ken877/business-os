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
  InMemorySchoolClassSchedulingStore,
  scheduleSession,
  listSessionsForTeacher,
  defaultConfig,
  type ClassSession,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolClassSchedulingStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.scheduling.manage",
    "school.scheduling.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-class-scheduling / scheduleSession", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      scheduleSession(ctx, denyDeps, { subject: "value", teacherUserId: "value", roomId: "ent_test", dayOfWeek: 1, startHour: 0, startMinute: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-class-scheduling / listSessionsForTeacher", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listSessionsForTeacher(ctx, denyDeps, { teacherUserId: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-class-scheduling / conflict detection", () => {
  it("schedules a session and detects teacher conflicts", () => {
    const { ctx, deps } = setup();
    const r1 = scheduleSession(ctx, deps, {
      subject: "Math", teacherUserId: "t-1", roomId: "ent_r1",
      dayOfWeek: 1, startHour: 9, startMinute: 0,
    });
    expect(isOk(r1)).toBe(true);
    // Same teacher, same slot, different room.
    const r2 = scheduleSession(ctx, deps, {
      subject: "Science", teacherUserId: "t-1", roomId: "ent_r2",
      dayOfWeek: 1, startHour: 9, startMinute: 0,
    });
    expect(isErr(r2)).toBe(true);
    if (!r2.ok) expect(r2.error.code).toBe("CONFLICT");
  });
  it("detects room conflicts", () => {
    const { ctx, deps } = setup();
    scheduleSession(ctx, deps, {
      subject: "Math", teacherUserId: "t-1", roomId: "ent_r1",
      dayOfWeek: 1, startHour: 9, startMinute: 0,
    });
    const r = scheduleSession(ctx, deps, {
      subject: "History", teacherUserId: "t-2", roomId: "ent_r1",
      dayOfWeek: 1, startHour: 9, startMinute: 0,
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
});
