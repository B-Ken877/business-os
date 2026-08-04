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
  InMemoryRestaurantKitchenDisplayStore,
  createTicket,
  markTicketReady,
  listTicketsForStation,
  defaultConfig,
  type KitchenTicket,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantKitchenDisplayStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.kitchen.tickets.read",
    "restaurant.kitchen.tickets.update",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-kitchen-display / createTicket", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createTicket(ctx, denyDeps, { orderId: "ent_test", itemsJson: "value", station: "value", priority: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-kitchen-display / markTicketReady", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markTicketReady(ctx, denyDeps, { ticketId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-kitchen-display / listTicketsForStation", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listTicketsForStation(ctx, denyDeps, { station: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-kitchen-display / ticket lifecycle", () => {
  it("creates and marks a ticket ready", () => {
    const { ctx, deps } = setup();
    const t = createTicket(ctx, deps, {
      orderId: "ent_o1", itemsJson: "[]", station: "grill", priority: 1,
    });
    expect(isOk(t)).toBe(true);
    if (!t.ok) return;
    expect(t.value.status).toBe("queued");
    const r = markTicketReady(ctx, deps, { ticketId: t.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("ready");
  });
  it("lists open tickets sorted by priority", () => {
    const { ctx, deps } = setup();
    createTicket(ctx, deps, { orderId: "o1", itemsJson: "[]", station: "grill", priority: 5 });
    createTicket(ctx, deps, { orderId: "o2", itemsJson: "[]", station: "grill", priority: 1 });
    createTicket(ctx, deps, { orderId: "o3", itemsJson: "[]", station: "salad", priority: 1 });
    const r = listTicketsForStation(ctx, deps, { station: "grill" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(2);
    expect(r.value[0].priority).toBe(1);
  });
});
