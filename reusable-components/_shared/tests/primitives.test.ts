import { describe, it, expect } from "vitest";
import {
  createTenantContext,
  asTenantId,
  asUserId,
  assertSameTenant,
  isSameTenant,
  TenantIsolationError,
  asPermission,
  PermissionDeniedError,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  ok,
  err,
  isOk,
  isErr,
  tryAsResult,
  createAuditEntry,
  InMemoryAuditSink,
  asEntityId,
  generateId,
  ErrorCode,
} from "../index";

describe("shared/tenant", () => {
  it("builds a TenantContext from raw inputs", () => {
    const ctx = createTenantContext({
      tenantId: "t-1",
      userId: "u-1",
      roles: ["owner"],
    });
    expect(ctx.tenantId).toBe("t-1");
    expect(ctx.userId).toBe("u-1");
    expect(ctx.roles).toEqual(["owner"]);
    expect(ctx.resolvedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("rejects empty tenant / user ids", () => {
    expect(() => asTenantId("")).toThrow();
    expect(() => asTenantId("   ")).toThrow();
    expect(() => asUserId("")).toThrow();
  });

  it("passes assertSameTenant when resource belongs to context tenant", () => {
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    expect(() => assertSameTenant(ctx, asTenantId("t-1"))).not.toThrow();
    expect(isSameTenant(ctx, "t-1")).toBe(true);
  });

  it("throws TenantIsolationError when resource belongs to another tenant", () => {
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    expect(() => assertSameTenant(ctx, asTenantId("t-2"))).toThrow(TenantIsolationError);
    expect(isSameTenant(ctx, "t-2")).toBe(false);
  });

  it("does not leak which side mismatched in the error message", () => {
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    try {
      assertSameTenant(ctx, asTenantId("t-2"));
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(TenantIsolationError);
      const msg = (e as Error).message;
      // Message must NOT contain either tenant id — preventing enumeration.
      expect(msg).not.toContain("t-1");
      expect(msg).not.toContain("t-2");
    }
  });
});

describe("shared/permissions", () => {
  it("rejects permission strings without a dot separator", () => {
    expect(() => asPermission("edit")).toThrow();
    expect(() => asPermission("")).toThrow();
    expect(() => asPermission("inventory.products.update")).not.toThrow();
  });

  it("grants and checks permissions per-tenant per-user", () => {
    const checker = new InMemoryPermissionChecker([
      {
        tenantId: "t-1",
        userId: "u-1",
        permissions: ["inventory.products.update"],
      },
    ]);
    const ctxT1 = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    const ctxT2 = createTenantContext({ tenantId: "t-2", userId: "u-1" });
    expect(checker.has(ctxT1, asPermission("inventory.products.update"))).toBe(true);
    // Same user id, different tenant — must NOT inherit permissions.
    expect(checker.has(ctxT2, asPermission("inventory.products.update"))).toBe(false);
  });

  it("require() throws PermissionDeniedError without revealing which permission", () => {
    const checker = new InMemoryPermissionChecker();
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    try {
      checker.require(ctx, asPermission("inventory.products.update"));
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(PermissionDeniedError);
      expect((e as Error).message).not.toContain("inventory");
    }
  });

  it("DenyAllPermissionChecker denies everything", () => {
    const checker = new DenyAllPermissionChecker();
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    expect(checker.has(ctx, asPermission("any.thing"))).toBe(false);
    expect(() => checker.require(ctx, asPermission("any.thing"))).toThrow(PermissionDeniedError);
  });
});

describe("shared/result", () => {
  it("ok() carries the value and isOk narrows", () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (isOk(r)) {
      expect(r.value).toBe(42);
    }
  });

  it("err() carries the structured error and isErr narrows", () => {
    const r = err(ErrorCode.INVALID_INPUT, "price must be positive");
    expect(r.ok).toBe(false);
    if (isErr(r)) {
      expect(r.error.code).toBe("INVALID_INPUT");
      expect(r.error.message).toBe("price must be positive");
    }
  });

  it("err() accepts a pre-built error object", () => {
    const r = err({ code: "X", message: "y" });
    if (isErr(r)) {
      expect(r.error.code).toBe("X");
    }
  });

  it("tryAsResult wraps thrown errors", () => {
    const r = tryAsResult(() => {
      throw new Error("boom");
    });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) {
      expect(r.error.code).toBe("THROWN");
      expect(r.error.message).toBe("boom");
    }
  });
});

describe("shared/audit", () => {
  it("createAuditEntry requires all mandatory fields", () => {
    const tenantId = asTenantId("t-1");
    const userId = asUserId("u-1");
    expect(() =>
      createAuditEntry({
        tenantId,
        actorUserId: userId,
        componentId: "",
        action: "x",
        entityType: "y",
        entityId: "z",
      })
    ).toThrow();
  });

  it("InMemoryAuditSink records and lists entries", () => {
    const sink = new InMemoryAuditSink();
    const tenantId = asTenantId("t-1");
    const userId = asUserId("u-1");
    const entry = createAuditEntry({
      tenantId,
      actorUserId: userId,
      componentId: "retail-inventory",
      action: "stock.adjusted",
      entityType: "product",
      entityId: "p-1",
      details: { delta: -2 },
    });
    sink.record(entry);
    expect(sink.list()).toHaveLength(1);
    expect(sink.filter((e) => e.action === "stock.adjusted")).toHaveLength(1);
    expect(sink.filter((e) => e.action === "other")).toHaveLength(0);
  });

  it("audit details are frozen", () => {
    const entry = createAuditEntry({
      tenantId: asTenantId("t-1"),
      actorUserId: asUserId("u-1"),
      componentId: "x",
      action: "y",
      entityType: "z",
      entityId: "1",
      details: { foo: "bar" },
    });
    expect(() => {
      // details is Readonly<Record> — assignment should fail at type-check,
      // and the runtime object is frozen.
      (entry.details as Record<string, unknown>).foo = "mutated";
    }).toThrow();
  });
});

describe("shared/ids", () => {
  it("asEntityId rejects empty strings", () => {
    expect(() => asEntityId("")).toThrow();
    expect(() => asEntityId("p-1")).not.toThrow();
  });

  it("generateId produces unique, prefixed ids", () => {
    const a = generateId("prod");
    const b = generateId("prod");
    expect(a).not.toBe(b);
    expect(a.startsWith("prod_")).toBe(true);
  });
});
