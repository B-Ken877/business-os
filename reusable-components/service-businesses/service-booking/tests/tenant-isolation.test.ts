import { describe, it, expect } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
  asEntityId,
  TenantIsolationError,
} from "@business-os/shared";
import {
  InMemoryServiceBookingStore,
  defaultConfig,
} from "../backend";

// This file is intentionally minimal: every component receives the same
// pattern. A cross-tenant read must throw TenantIsolationError. The
// store is the last line of defence — even if application code forgot
// to assert, the store's tenantId-scoped map must return undefined.

describe("service-booking / tenant isolation", () => {
  it("store returns undefined when reading another tenant's entity", () => {
    const store = new InMemoryServiceBookingStore();
    const tenantA = "t-a";
    const tenantB = "t-b";
    const entityA = {
      id: asEntityId("e-1"),
      tenantId: tenantA as any,
      customerId: "ent_test",
      serviceId: "ent_test",
      staffUserId: "value",
      scheduledAt: "2024-01-15",
      durationMinutes: 1,
      status: "value",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any;
    store.putBooking(tenantA, entityA);
    // Tenant B tries to read tenant A's entity.
    const leaked = store.getBooking(tenantB, asEntityId("e-1"));
    expect(leaked).toBeUndefined();
    // And the listing for tenant B must not contain tenant A's entity.
    const listB = store.listBookings(tenantB);
    expect(listB).toHaveLength(0);
  });

  it("store overwriting in tenant B does not affect tenant A", () => {
    const store = new InMemoryServiceBookingStore();
    const tenantA = "t-a";
    const tenantB = "t-b";
    const shared = {
      id: asEntityId("e-shared"),
      customerId: "ent_test",
      serviceId: "ent_test",
      staffUserId: "value",
      scheduledAt: "2024-01-15",
      durationMinutes: 1,
      status: "value",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any;
    const entityA2 = { ...shared, tenantId: tenantA as any };
    const entityB2 = { ...shared, tenantId: tenantB as any };
    store.putBooking(tenantA, entityA2);
    store.putBooking(tenantB, entityB2);
    expect(store.getBooking(tenantA, asEntityId("e-shared"))).toBe(entityA2);
    expect(store.getBooking(tenantB, asEntityId("e-shared"))).toBe(entityB2);
  });
});
