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
  InMemoryServiceCatalogStore,
  createService,
  listActiveServices,
  defaultConfig,
  type Service,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryServiceCatalogStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "service.catalog.manage",
    "service.catalog.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("service-catalog / createService", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createService(ctx, denyDeps, { name: "value", categoryId: "ent_test", priceCents: 0, currency: "value", durationMinutes: 1, description: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-catalog / listActiveServices", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listActiveServices(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-catalog / create + list rules", () => {
  it("creates and lists active services", () => {
    const { ctx, deps } = setup();
    createService(ctx, deps, { name: "Haircut", categoryId: "ent_c1", priceCents: 1500, currency: "HTG", durationMinutes: 30 });
    createService(ctx, deps, { name: "Color", categoryId: "ent_c1", priceCents: 5000, currency: "HTG", durationMinutes: 90 });
    const r = listActiveServices(ctx, deps);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(2);
  });
});
