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
  InMemoryNotificationsCenterStore,
  pushNotification,
  listUnreadForCurrentUser,
  markRead,
  defaultConfig,
  type Notification,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryNotificationsCenterStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "notifications.push",
    "notifications.read",
    "notifications.dismiss",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("notifications-center / pushNotification", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      pushNotification(ctx, denyDeps, { recipientUserId: "value", title: "value", body: "value", actionLabel: undefined, actionUrl: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("notifications-center / listUnreadForCurrentUser", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listUnreadForCurrentUser(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("notifications-center / markRead", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markRead(ctx, denyDeps, { notificationId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("notifications-center / pushNotification happy path", () => {
  it("pushes a notification with a future expiry", () => {
    const { ctx, deps } = setup();
    const r = pushNotification(ctx, deps, {
      recipientUserId: "u-1",
      title: "Low stock alert",
      body: "Product X has 2 units left",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.expiresAt).not.toBe(r.value.createdAt);
  });

  it("lists only unread, non-expired notifications for the current user", () => {
    const { ctx, deps } = setup();
    pushNotification(ctx, deps, { recipientUserId: "u-1", title: "t1", body: "b1" });
    pushNotification(ctx, deps, { recipientUserId: "u-2", title: "t2", body: "b2" });
    const r = listUnreadForCurrentUser(ctx, deps);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(1);  // only u-1's, since ctx.userId is "u-1"
    expect(r.value[0].recipientUserId).toBe("u-1");
  });
});
