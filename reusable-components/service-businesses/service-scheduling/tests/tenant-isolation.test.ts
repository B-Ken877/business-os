import { describe, it, expect } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
  asEntityId,
  TenantIsolationError,
} from "@business-os/shared";
import {
  InMemoryServiceSchedulingStore,
  defaultConfig,
} from "../backend";

// This file is intentionally minimal: every component receives the same
// pattern. A cross-tenant read must throw TenantIsolationError. The
// store is the last line of defence — even if application code forgot
// to assert, the store's tenantId-scoped map must return undefined.

describe("service-scheduling / tenant isolation", () => {
  it("store returns undefined when reading another tenant's entity", () => {
    const store = new InMemoryServiceSchedulingStore();
    const tenantA = "t-a";
    const tenantB = "t-b";
    const entityA = {
      id: asEntityId("e-1"),
      tenantId: tenantA as any,
      staffUserId: "value",
      dayOfWeek: 1,
      startHour: 0,
      endHour: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any;
    store.putStaffAvailability(tenantA, entityA);
    // Tenant B tries to read tenant A's entity.
    const leaked = store.getStaffAvailability(tenantB, asEntityId("e-1"));
    expect(leaked).toBeUndefined();
    // And the listing for tenant B must not contain tenant A's entity.
    const listB = store.listStaffAvailabilitys(tenantB);
    expect(listB).toHaveLength(0);
  });

  it("store overwriting in tenant B does not affect tenant A", () => {
    const store = new InMemoryServiceSchedulingStore();
    const tenantA = "t-a";
    const tenantB = "t-b";
    const shared = {
      id: asEntityId("e-shared"),
      staffUserId: "value",
      dayOfWeek: 1,
      startHour: 0,
      endHour: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any;
    const entityA2 = { ...shared, tenantId: tenantA as any };
    const entityB2 = { ...shared, tenantId: tenantB as any };
    store.putStaffAvailability(tenantA, entityA2);
    store.putStaffAvailability(tenantB, entityB2);
    expect(store.getStaffAvailability(tenantA, asEntityId("e-shared"))).toBe(entityA2);
    expect(store.getStaffAvailability(tenantB, asEntityId("e-shared"))).toBe(entityB2);
  });
});
