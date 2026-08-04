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
  InMemoryRestaurantDeliveryManagementStore,
  assignDriver,
  confirmDelivered,
  defaultConfig,
  type Delivery,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantDeliveryManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.delivery.assign",
    "restaurant.delivery.update",
    "restaurant.delivery.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-delivery-management / assignDriver", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      assignDriver(ctx, denyDeps, { deliveryId: "ent_test", driverId: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-delivery-management / confirmDelivered", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      confirmDelivered(ctx, denyDeps, { deliveryId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-delivery-management / assign + deliver rules", () => {
  it("assigns a driver and confirms delivery", () => {
    const { ctx, deps } = setup();
    // Seed a delivery.
    const delivery: any = {
      id: "ent_d1" as any, tenantId: ctx.tenantId as any,
      orderId: "ent_o1", address: "123 Main St", driverId: null,
      status: "pending", pickedUpAt: null, deliveredAt: null,
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putDelivery(ctx.tenantId, delivery);
    const a = assignDriver(ctx, deps, { deliveryId: "ent_d1", driverId: "drv-1" });
    expect(isOk(a)).toBe(true);
    if (!a.ok) return;
    expect(a.value.status).toBe("assigned");
    const d = confirmDelivered(ctx, deps, { deliveryId: "ent_d1" });
    expect(isOk(d)).toBe(true);
    if (!d.ok) return;
    expect(d.value.status).toBe("delivered");
  });
  it("rejects assigning a driver to an already-assigned delivery", () => {
    const { ctx, deps } = setup();
    const delivery: any = {
      id: "ent_d1" as any, tenantId: ctx.tenantId as any,
      orderId: "o", address: "a", driverId: "drv-1", status: "assigned",
      pickedUpAt: null, deliveredAt: null,
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    };
    deps.store.putDelivery(ctx.tenantId, delivery);
    const r = assignDriver(ctx, deps, { deliveryId: "ent_d1", driverId: "drv-2" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
