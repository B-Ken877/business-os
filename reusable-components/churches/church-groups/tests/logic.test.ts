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
  InMemoryChurchGroupsStore,
  createGroup,
  joinGroup,
  defaultConfig,
  type Group,
  type GroupMembership,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryChurchGroupsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "church.groups.manage",
    "church.groups.read",
    "church.groups.join",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("church-groups / createGroup", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createGroup(ctx, denyDeps, { name: "value", leaderMemberId: "value", maxMembers: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-groups / joinGroup", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      joinGroup(ctx, denyDeps, { groupId: "ent_test", memberId: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-groups / create + join rules", () => {
  it("creates a group with the leader auto-added", () => {
    const { ctx, deps } = setup();
    const g = createGroup(ctx, deps, { name: "Youth", leaderMemberId: "ent_m1", maxMembers: 10 });
    expect(isOk(g)).toBe(true);
    if (!g.ok) return;
    // Leader joining their own group should fail (already a member).
    const r = joinGroup(ctx, deps, { groupId: g.value.id, memberId: "ent_m1" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
  it("enforces group capacity", () => {
    const { ctx, deps } = setup();
    const g = createGroup(ctx, deps, { name: "Small", leaderMemberId: "ent_m1", maxMembers: 1 });
    if (!g.ok) throw new Error("setup failed");
    // Leader counts as 1; capacity is 1, so a second member fails.
    const r = joinGroup(ctx, deps, { groupId: g.value.id, memberId: "ent_m2" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("LIMIT_EXCEEDED");
  });
});
