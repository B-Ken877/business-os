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
  InMemoryChurchVolunteersStore,
  createVolunteer,
  assignVolunteer,
  defaultConfig,
  type Volunteer,
  type VolunteerAssignment,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryChurchVolunteersStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "church.volunteers.manage",
    "church.volunteers.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("church-volunteers / createVolunteer", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createVolunteer(ctx, denyDeps, { memberId: "value", role: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-volunteers / assignVolunteer", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      assignVolunteer(ctx, denyDeps, { volunteerId: "ent_test", assignmentType: "value", assignmentId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-volunteers / create + assign rules", () => {
  it("creates a volunteer and assigns them", () => {
    const { ctx, deps } = setup();
    const v = createVolunteer(ctx, deps, { memberId: "ent_m1", role: "usher" });
    expect(isOk(v)).toBe(true);
    if (!v.ok) return;
    const a = assignVolunteer(ctx, deps, {
      volunteerId: v.value.id, assignmentType: "event", assignmentId: "ent_e1",
    });
    expect(isOk(a)).toBe(true);
  });
  it("rejects duplicate volunteer records for the same member", () => {
    const { ctx, deps } = setup();
    createVolunteer(ctx, deps, { memberId: "ent_m1", role: "usher" });
    const r = createVolunteer(ctx, deps, { memberId: "ent_m1", role: "greeter" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
  it("rejects duplicate assignments", () => {
    const { ctx, deps } = setup();
    const v = createVolunteer(ctx, deps, { memberId: "ent_m1", role: "usher" });
    if (!v.ok) throw new Error("setup failed");
    assignVolunteer(ctx, deps, { volunteerId: v.value.id, assignmentType: "event", assignmentId: "ent_e1" });
    const r = assignVolunteer(ctx, deps, { volunteerId: v.value.id, assignmentType: "event", assignmentId: "ent_e1" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
});
