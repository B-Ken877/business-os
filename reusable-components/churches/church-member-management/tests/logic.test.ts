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
  InMemoryChurchMemberManagementStore,
  createMember,
  listVisibleMembers,
  updateOwnVisibility,
  defaultConfig,
  type Member,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryChurchMemberManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "church.members.manage",
    "church.members.read",
    "church.members.update_own",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("church-member-management / createMember", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createMember(ctx, denyDeps, { firstName: "value", lastName: "value", phone: undefined, email: undefined, familyId: undefined, directoryVisibility: "visible" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-member-management / listVisibleMembers", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listVisibleMembers(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-member-management / updateOwnVisibility", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      updateOwnVisibility(ctx, denyDeps, { memberId: "ent_test", visibility: "visible" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-member-management / directory visibility rules", () => {
  it("creates a visible member and lists them", () => {
    const { ctx, deps } = setup();
    createMember(ctx, deps, { firstName: "Jean", lastName: "B", directoryVisibility: "visible" });
    createMember(ctx, deps, { firstName: "Marie", lastName: "J", directoryVisibility: "hidden" });
    const r = listVisibleMembers(ctx, deps);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(1);
    expect(r.value[0].firstName).toBe("Jean");
  });
  it("allows updating visibility", () => {
    const { ctx, deps } = setup();
    const m = createMember(ctx, deps, { firstName: "J", lastName: "B", directoryVisibility: "visible" });
    if (!m.ok) throw new Error("setup failed");
    const r = updateOwnVisibility(ctx, deps, { memberId: m.value.id, visibility: "hidden" });
    expect(isOk(r)).toBe(true);
    const list = listVisibleMembers(ctx, deps);
    if (!list.ok) throw new Error("setup failed");
    expect(list.value).toHaveLength(0);  // now hidden
  });
  it("rejects no-op visibility updates", () => {
    const { ctx, deps } = setup();
    const m = createMember(ctx, deps, { firstName: "J", lastName: "B", directoryVisibility: "visible" });
    if (!m.ok) throw new Error("setup failed");
    const r = updateOwnVisibility(ctx, deps, { memberId: m.value.id, visibility: "visible" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
