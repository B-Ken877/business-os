import { describe, it, expect } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
  asEntityId,
  TenantIsolationError,
} from "@business-os/shared";
import {
  InMemoryClinicConsentStore,
  defaultConfig,
} from "../backend";

// This file is intentionally minimal: every component receives the same
// pattern. A cross-tenant read must throw TenantIsolationError. The
// store is the last line of defence — even if application code forgot
// to assert, the store's tenantId-scoped map must return undefined.

describe("clinic-consent / tenant isolation", () => {
  it("store returns undefined when reading another tenant's entity", () => {
    const store = new InMemoryClinicConsentStore();
    const tenantA = "t-a";
    const tenantB = "t-b";
    const entityA = {
      id: asEntityId("e-1"),
      tenantId: tenantA as any,
      patientId: "ent_test",
      purpose: "value",
      grantedAt: "2024-01-15",
      revokedAt: undefined,
      revokeReason: undefined,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any;
    store.putConsentRecord(tenantA, entityA);
    // Tenant B tries to read tenant A's entity.
    const leaked = store.getConsentRecord(tenantB, asEntityId("e-1"));
    expect(leaked).toBeUndefined();
    // And the listing for tenant B must not contain tenant A's entity.
    const listB = store.listConsentRecords(tenantB);
    expect(listB).toHaveLength(0);
  });

  it("store overwriting in tenant B does not affect tenant A", () => {
    const store = new InMemoryClinicConsentStore();
    const tenantA = "t-a";
    const tenantB = "t-b";
    const shared = {
      id: asEntityId("e-shared"),
      patientId: "ent_test",
      purpose: "value",
      grantedAt: "2024-01-15",
      revokedAt: undefined,
      revokeReason: undefined,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any;
    const entityA2 = { ...shared, tenantId: tenantA as any };
    const entityB2 = { ...shared, tenantId: tenantB as any };
    store.putConsentRecord(tenantA, entityA2);
    store.putConsentRecord(tenantB, entityB2);
    expect(store.getConsentRecord(tenantA, asEntityId("e-shared"))).toBe(entityA2);
    expect(store.getConsentRecord(tenantB, asEntityId("e-shared"))).toBe(entityB2);
  });
});
