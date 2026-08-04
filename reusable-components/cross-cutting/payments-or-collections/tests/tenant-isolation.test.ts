import { describe, it, expect } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
  asEntityId,
  TenantIsolationError,
} from "@business-os/shared";
import {
  InMemoryPaymentsOrCollectionsStore,
  defaultConfig,
} from "../backend";

// This file is intentionally minimal: every component receives the same
// pattern. A cross-tenant read must throw TenantIsolationError. The
// store is the last line of defence — even if application code forgot
// to assert, the store's tenantId-scoped map must return undefined.

describe("payments-or-collections / tenant isolation", () => {
  it("store returns undefined when reading another tenant's entity", () => {
    const store = new InMemoryPaymentsOrCollectionsStore();
    const tenantA = "t-a";
    const tenantB = "t-b";
    const entityA = {
      id: asEntityId("e-1"),
      tenantId: tenantA as any,
      amount: 1,
      currency: "value",
      method: "cash",
      providerReference: undefined,
      invoiceId: undefined,
      payerName: undefined,
      status: "value",
      refundedAt: undefined,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any;
    store.putPayment(tenantA, entityA);
    // Tenant B tries to read tenant A's entity.
    const leaked = store.getPayment(tenantB, asEntityId("e-1"));
    expect(leaked).toBeUndefined();
    // And the listing for tenant B must not contain tenant A's entity.
    const listB = store.listPayments(tenantB);
    expect(listB).toHaveLength(0);
  });

  it("store overwriting in tenant B does not affect tenant A", () => {
    const store = new InMemoryPaymentsOrCollectionsStore();
    const tenantA = "t-a";
    const tenantB = "t-b";
    const shared = {
      id: asEntityId("e-shared"),
      amount: 1,
      currency: "value",
      method: "cash",
      providerReference: undefined,
      invoiceId: undefined,
      payerName: undefined,
      status: "value",
      refundedAt: undefined,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any;
    const entityA2 = { ...shared, tenantId: tenantA as any };
    const entityB2 = { ...shared, tenantId: tenantB as any };
    store.putPayment(tenantA, entityA2);
    store.putPayment(tenantB, entityB2);
    expect(store.getPayment(tenantA, asEntityId("e-shared"))).toBe(entityA2);
    expect(store.getPayment(tenantB, asEntityId("e-shared"))).toBe(entityB2);
  });
});
