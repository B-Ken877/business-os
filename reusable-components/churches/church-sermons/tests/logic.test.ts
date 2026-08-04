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
  InMemoryChurchSermonsStore,
  recordSermon,
  listSermonsBySpeaker,
  defaultConfig,
  type Sermon,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryChurchSermonsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "church.sermons.manage",
    "church.sermons.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("church-sermons / recordSermon", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordSermon(ctx, denyDeps, { title: "value", speakerMemberId: "value", deliveredAt: "2024-01-15", scriptureReferences: undefined, seriesId: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-sermons / listSermonsBySpeaker", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listSermonsBySpeaker(ctx, denyDeps, { speakerMemberId: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-sermons / record + list rules", () => {
  it("records sermons and lists by speaker", () => {
    const { ctx, deps } = setup();
    recordSermon(ctx, deps, { title: "Faith", speakerMemberId: "ent_m1", deliveredAt: "2024-01-01" });
    recordSermon(ctx, deps, { title: "Hope", speakerMemberId: "ent_m1", deliveredAt: "2024-01-08" });
    recordSermon(ctx, deps, { title: "Love", speakerMemberId: "ent_m2", deliveredAt: "2024-01-08" });
    const r = listSermonsBySpeaker(ctx, deps, { speakerMemberId: "ent_m1" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(2);
    expect(r.value[0].title).toBe("Hope");  // newest first
  });
});
