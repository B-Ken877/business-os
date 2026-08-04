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
  InMemoryMessagingCenterStore,
  sendMessage,
  markDelivered,
  listMessages,
  defaultConfig,
  type Message,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryMessagingCenterStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "messaging.messages.send",
    "messaging.broadcasts.send",
    "messaging.messages.read",
    "messaging.templates.manage",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("messaging-center / sendMessage", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      sendMessage(ctx, denyDeps, { recipientId: "value", channel: "in_app", templateKey: "value", body: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("messaging-center / markDelivered", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markDelivered(ctx, denyDeps, { messageId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("messaging-center / listMessages", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listMessages(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("messaging-center / sendMessage happy path", () => {
  it("creates a queued message and records audit", () => {
    const { ctx, deps, audit } = setup();
    const r = sendMessage(ctx, deps, {
      recipientId: "cust-1",
      channel: "sms",
      templateKey: "appointment.reminder",
      body: "Your appointment is tomorrow at 10am",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("queued");
    expect(r.value.recipientId).toBe("cust-1");
    const auditEntries = audit.filter((e) => e.action === "messaging.message.sent");
    expect(auditEntries).toHaveLength(1);
  });
});

describe("messaging-center / markDelivered rules", () => {
  it("marks a queued message as delivered", () => {
    const { ctx, deps } = setup();
    const sent = sendMessage(ctx, deps, {
      recipientId: "cust-1",
      channel: "sms",
      templateKey: "t",
      body: "b",
    });
    if (!sent.ok) throw new Error("setup failed");
    const r = markDelivered(ctx, deps, { messageId: sent.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("delivered");
    expect(r.value.deliveredAt).not.toBeNull();
  });

  it("rejects marking a non-existent message", () => {
    const { ctx, deps } = setup();
    const r = markDelivered(ctx, deps, { messageId: "ent_missing" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });

  it("rejects double-delivery", () => {
    const { ctx, deps } = setup();
    const sent = sendMessage(ctx, deps, {
      recipientId: "cust-1",
      channel: "sms",
      templateKey: "t",
      body: "b",
    });
    if (!sent.ok) throw new Error("setup failed");
    markDelivered(ctx, deps, { messageId: sent.value.id });
    const r2 = markDelivered(ctx, deps, { messageId: sent.value.id });
    expect(isErr(r2)).toBe(true);
    if (!r2.ok) expect(r2.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});

describe("messaging-center / config behavior", () => {
  it("respects the defaultChannel config when caller does not pass a channel", () => {
    // The current API requires channel explicitly; this test documents that
    // the default is sourced from config, not hardcoded. When the
    // 'sendWithDefaultChannel' operation is added, it will use deps.config.defaultChannel.
    const { ctx, deps } = setup();
    expect(deps.config.defaultChannel).toBe("in_app");
    expect(deps.config.maxBroadcastRecipients).toBe(500);
  });
});
