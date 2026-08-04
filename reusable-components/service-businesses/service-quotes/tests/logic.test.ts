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
  InMemoryServiceQuotesStore,
  createQuote,
  approveQuote,
  defaultConfig,
  type Quote,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryServiceQuotesStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "service.quotes.create",
    "service.quotes.read",
    "service.quotes.approve",
    "service.quotes.reject",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("service-quotes / createQuote", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createQuote(ctx, denyDeps, { customerName: "value", customerPhone: undefined, itemsJson: "value", totalCents: 0, currency: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-quotes / approveQuote", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      approveQuote(ctx, denyDeps, { quoteId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-quotes / create + approve rules", () => {
  it("creates and approves a quote", () => {
    const { ctx, deps } = setup();
    const q = createQuote(ctx, deps, {
      customerName: "Jean", itemsJson: JSON.stringify([{ serviceId: "s1", quantity: 1 }]),
      totalCents: 5000, currency: "HTG",
    });
    expect(isOk(q)).toBe(true);
    if (!q.ok) return;
    expect(q.value.status).toBe("draft");
    const a = approveQuote(ctx, deps, { quoteId: q.value.id });
    expect(isOk(a)).toBe(true);
    if (!a.ok) return;
    expect(a.value.status).toBe("approved");
  });
  it("rejects malformed itemsJson", () => {
    const { ctx, deps } = setup();
    const r = createQuote(ctx, deps, {
      customerName: "X", itemsJson: "not json", totalCents: 0, currency: "HTG",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
