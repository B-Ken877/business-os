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
  InMemoryRestaurantOrderManagementStore,
  createOrder,
  advanceOrderStatus,
  cancelOrder,
  defaultConfig,
  type Order,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantOrderManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.orders.create",
    "restaurant.orders.update_status",
    "restaurant.orders.read",
    "restaurant.orders.cancel",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-order-management / createOrder", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createOrder(ctx, denyDeps, { itemsJson: "value", fulfillmentType: "dine_in", tableId: undefined, deliveryAddress: undefined, specialInstructions: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-order-management / advanceOrderStatus", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      advanceOrderStatus(ctx, denyDeps, { orderId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-order-management / cancelOrder", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      cancelOrder(ctx, denyDeps, { orderId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-order-management / createOrder happy path", () => {
  it("creates a dine-in order with a table", () => {
    const { ctx, deps } = setup();
    const r = createOrder(ctx, deps, {
      itemsJson: JSON.stringify([{ itemId: "ent_i1", quantity: 2 }]),
      fulfillmentType: "dine_in",
      tableId: "ent_t1",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("placed");
  });
  it("rejects dine-in without a table", () => {
    const { ctx, deps } = setup();
    const r = createOrder(ctx, deps, {
      itemsJson: JSON.stringify([{ itemId: "ent_i1", quantity: 1 }]),
      fulfillmentType: "dine_in",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects delivery without an address", () => {
    const { ctx, deps } = setup();
    const r = createOrder(ctx, deps, {
      itemsJson: JSON.stringify([{ itemId: "ent_i1", quantity: 1 }]),
      fulfillmentType: "delivery",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-order-management / state machine", () => {
  it("advances placed → in_kitchen → ready → served", () => {
    const { ctx, deps } = setup();
    const o = createOrder(ctx, deps, {
      itemsJson: JSON.stringify([{ itemId: "i", quantity: 1 }]),
      fulfillmentType: "takeout",
    });
    if (!o.ok) throw new Error("setup failed");
    const r1 = advanceOrderStatus(ctx, deps, { orderId: o.value.id });
    expect(isOk(r1)).toBe(true);
    if (!r1.ok) return;
    expect(r1.value.status).toBe("in_kitchen");
    const r2 = advanceOrderStatus(ctx, deps, { orderId: o.value.id });
    expect(isOk(r2)).toBe(true);
    if (!r2.ok) return;
    expect(r2.value.status).toBe("ready");
    const r3 = advanceOrderStatus(ctx, deps, { orderId: o.value.id });
    expect(isOk(r3)).toBe(true);
    if (!r3.ok) return;
    expect(r3.value.status).toBe("served");
    // Served is terminal — cannot advance.
    const r4 = advanceOrderStatus(ctx, deps, { orderId: o.value.id });
    expect(isErr(r4)).toBe(true);
    if (!r4.ok) expect(r4.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
  it("cancels a placed order", () => {
    const { ctx, deps } = setup();
    const o = createOrder(ctx, deps, {
      itemsJson: JSON.stringify([{ itemId: "i", quantity: 1 }]),
      fulfillmentType: "takeout",
    });
    if (!o.ok) throw new Error("setup failed");
    const r = cancelOrder(ctx, deps, { orderId: o.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("cancelled");
  });
  it("rejects cancelling a served order", () => {
    const { ctx, deps } = setup();
    const o = createOrder(ctx, deps, {
      itemsJson: JSON.stringify([{ itemId: "i", quantity: 1 }]),
      fulfillmentType: "takeout",
    });
    if (!o.ok) throw new Error("setup failed");
    advanceOrderStatus(ctx, deps, { orderId: o.value.id });
    advanceOrderStatus(ctx, deps, { orderId: o.value.id });
    advanceOrderStatus(ctx, deps, { orderId: o.value.id });
    const r = cancelOrder(ctx, deps, { orderId: o.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
