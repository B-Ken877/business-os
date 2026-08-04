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
  InMemoryRetailCustomerManagementStore,
  createCustomer,
  updateStatus,
  addLoyaltyNote,
  defaultConfig,
  type Customer,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRetailCustomerManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "retail.customers.create",
    "retail.customers.update",
    "retail.customers.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("retail-customer-management / createCustomer", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createCustomer(ctx, denyDeps, { name: "value", phone: undefined, email: undefined, address: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-customer-management / updateStatus", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      updateStatus(ctx, denyDeps, { customerId: "ent_test", newStatus: "active" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-customer-management / addLoyaltyNote", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      addLoyaltyNote(ctx, denyDeps, { customerId: "ent_test", note: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-customer-management / createCustomer + updateStatus happy path", () => {
  it("creates a customer and updates their status", () => {
    const { ctx, deps } = setup();
    const c = createCustomer(ctx, deps, { name: "Jean Baptiste", phone: "+509 1234" });
    expect(isOk(c)).toBe(true);
    if (!c.ok) return;
    expect(c.value.status).toBe("active");
    const r = updateStatus(ctx, deps, { customerId: c.value.id, newStatus: "vip" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("vip");
  });

  it("rejects no-op status updates", () => {
    const { ctx, deps } = setup();
    const c = createCustomer(ctx, deps, { name: "J" });
    if (!c.ok) throw new Error("setup failed");
    const r = updateStatus(ctx, deps, { customerId: c.value.id, newStatus: "active" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});

describe("retail-customer-management / addLoyaltyNote", () => {
  it("appends a timestamped note to the customer record", () => {
    const { ctx, deps } = setup();
    const c = createCustomer(ctx, deps, { name: "J" });
    if (!c.ok) throw new Error("setup failed");
    const r1 = addLoyaltyNote(ctx, deps, { customerId: c.value.id, note: "First visit" });
    expect(isOk(r1)).toBe(true);
    if (!r1.ok) return;
    expect(r1.value.loyaltyNotes).toContain("First visit");
    const r2 = addLoyaltyNote(ctx, deps, { customerId: c.value.id, note: "Second visit" });
    expect(isOk(r2)).toBe(true);
    if (!r2.ok) return;
    expect(r2.value.loyaltyNotes).toContain("First visit");
    expect(r2.value.loyaltyNotes).toContain("Second visit");
  });
});
