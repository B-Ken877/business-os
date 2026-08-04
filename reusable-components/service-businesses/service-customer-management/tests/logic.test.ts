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
  InMemoryServiceCustomerManagementStore,
  createCustomer,
  setPreferences,
  defaultConfig,
  type Customer,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryServiceCustomerManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "service.customers.create",
    "service.customers.update",
    "service.customers.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("service-customer-management / createCustomer", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createCustomer(ctx, denyDeps, { name: "value", phone: undefined, email: undefined, address: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-customer-management / setPreferences", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      setPreferences(ctx, denyDeps, { customerId: "ent_test", preferencesJson: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-customer-management / create + preferences rules", () => {
  it("creates a customer and sets preferences", () => {
    const { ctx, deps } = setup();
    const c = createCustomer(ctx, deps, { name: "Jean", phone: "+509 1234" });
    expect(isOk(c)).toBe(true);
    if (!c.ok) return;
    const p = setPreferences(ctx, deps, {
      customerId: c.value.id,
      preferencesJson: JSON.stringify({ preferredStaff: "u-1" }),
    });
    expect(isOk(p)).toBe(true);
  });
  it("rejects malformed preferencesJson", () => {
    const { ctx, deps } = setup();
    const c = createCustomer(ctx, deps, { name: "J" });
    if (!c.ok) throw new Error("setup failed");
    const r = setPreferences(ctx, deps, { customerId: c.value.id, preferencesJson: "not json" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
