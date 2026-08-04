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
  InMemoryChurchAnnouncementsStore,
  publishAnnouncement,
  listActiveAnnouncements,
  defaultConfig,
  type Announcement,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryChurchAnnouncementsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "church.announcements.publish",
    "church.announcements.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("church-announcements / publishAnnouncement", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      publishAnnouncement(ctx, denyDeps, { title: "value", body: "value", audience: "public" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-announcements / listActiveAnnouncements", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listActiveAnnouncements(ctx, denyDeps, { audience: "public" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-announcements / publish + list rules", () => {
  it("publishes and lists active announcements", () => {
    const { ctx, deps } = setup();
    publishAnnouncement(ctx, deps, { title: "T1", body: "B1", audience: "members" });
    publishAnnouncement(ctx, deps, { title: "T2", body: "B2", audience: "public" });
    const r = listActiveAnnouncements(ctx, deps, { audience: "members" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(1);
    expect(r.value[0].title).toBe("T1");
  });
});
