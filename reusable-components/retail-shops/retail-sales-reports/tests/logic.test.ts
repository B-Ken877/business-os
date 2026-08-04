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
  InMemoryRetailSalesReportsStore,
  computeDailySummary,
  defaultConfig,
  type SaleRecord,
  type DailySalesSummary,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRetailSalesReportsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "retail.reports.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("retail-sales-reports / computeDailySummary", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      computeDailySummary(ctx, denyDeps, { date: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-sales-reports / computeDailySummary happy path", () => {
  it("computes zero summary when no sales exist", () => {
    const { ctx, deps } = setup();
    const r = computeDailySummary(ctx, deps, { date: "2024-01-15" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.totalSalesCount).toBe(0);
    expect(r.value.totalRevenueCents).toBe(0);
    expect(r.value.averageBasketCents).toBe(0);
  });

  it("aggregates sales for the given date", () => {
    const { ctx, deps } = setup();
    // Seed two sale records on 2024-01-15.
    const sale1: any = {
      id: "ent_s1" as any, tenantId: ctx.tenantId as any,
      totalCents: 1100, discountCents: 0, taxCents: 100,
      currency: "HTG", status: "completed",
      createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z",
    };
    const sale2: any = {
      ...sale1,
      id: "ent_s2" as any,
      totalCents: 2200, taxCents: 200,
      createdAt: "2024-01-15T11:00:00Z", updatedAt: "2024-01-15T11:00:00Z",
    };
    deps.store.putSaleRecord(ctx.tenantId, sale1);
    deps.store.putSaleRecord(ctx.tenantId, sale2);
    const r = computeDailySummary(ctx, deps, { date: "2024-01-15" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.totalSalesCount).toBe(2);
    expect(r.value.totalRevenueCents).toBe(3300);
    expect(r.value.totalTaxCents).toBe(300);
    expect(r.value.averageBasketCents).toBe(1650);
  });

  it("ignores sales on other dates", () => {
    const { ctx, deps } = setup();
    const sale: any = {
      id: "ent_s1" as any, tenantId: ctx.tenantId as any,
      totalCents: 1100, discountCents: 0, taxCents: 100,
      currency: "HTG", status: "completed",
      createdAt: "2024-01-16T10:00:00Z", updatedAt: "2024-01-16T10:00:00Z",
    };
    deps.store.putSaleRecord(ctx.tenantId, sale);
    const r = computeDailySummary(ctx, deps, { date: "2024-01-15" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.totalSalesCount).toBe(0);
  });
});
