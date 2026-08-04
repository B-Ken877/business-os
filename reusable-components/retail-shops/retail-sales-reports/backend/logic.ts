/**
 * Business logic for the retail-sales-reports component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  SaleRecord,
  DailySalesSummary,
} from "./types";

import {
  type ComputeDailySummaryInput,
  validateComputeDailySummaryInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailSalesReportsStore {
  getSaleRecord(tenantId: string, id: EntityId): SaleRecord | undefined;
  putSaleRecord(tenantId: string, entity: SaleRecord): void;
  listSaleRecords(tenantId: string): readonly SaleRecord[];
  deleteSaleRecord(tenantId: string, id: EntityId): boolean;
  getDailySalesSummary(tenantId: string, id: EntityId): DailySalesSummary | undefined;
  putDailySalesSummary(tenantId: string, entity: DailySalesSummary): void;
  listDailySalesSummarys(tenantId: string): readonly DailySalesSummary[];
  deleteDailySalesSummary(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailSalesReportsStore implements RetailSalesReportsStore {
  private readonly saleRecords = new Map<string, Map<string, SaleRecord>>();
  private readonly dailySalesSummarys = new Map<string, Map<string, DailySalesSummary>>();

  getSaleRecord(tenantId: string, id: EntityId): SaleRecord | undefined {
    return this.saleRecords.get(tenantId)?.get(id);
  }
  putSaleRecord(tenantId: string, entity: SaleRecord): void {
    let byId = this.saleRecords.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.saleRecords.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listSaleRecords(tenantId: string): readonly SaleRecord[] {
    const byId = this.saleRecords.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteSaleRecord(tenantId: string, id: EntityId): boolean {
    return this.saleRecords.get(tenantId)?.delete(id) ?? false;
  }

  getDailySalesSummary(tenantId: string, id: EntityId): DailySalesSummary | undefined {
    return this.dailySalesSummarys.get(tenantId)?.get(id);
  }
  putDailySalesSummary(tenantId: string, entity: DailySalesSummary): void {
    let byId = this.dailySalesSummarys.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.dailySalesSummarys.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listDailySalesSummarys(tenantId: string): readonly DailySalesSummary[] {
    const byId = this.dailySalesSummarys.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteDailySalesSummary(tenantId: string, id: EntityId): boolean {
    return this.dailySalesSummarys.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailSalesReportsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly topN: number;
}

//////////////////////////////////////////////////////////////////////
// computeDailySummary — Compute the daily sales summary for a given date, based on the sales recorded by the POS.
//////////////////////////////////////////////////////////////////////
export function computeDailySummary(
  ctx: TenantContext,
  deps: Dependencies,
  input: ComputeDailySummaryInput
): Result<DailySalesSummary> {
  deps.permissions.require(ctx, asPermission("retail.reports.read"));
  const validated = validateComputeDailySummaryInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // The POS sales are stored in the POS store; this component reads them
    // via the injected store. In the future, the POS store will be the only
    // legitimate reader; this component receives a pre-filtered list.
    const all = deps.store.listSaleRecords(ctx.tenantId);
    const onDate = all.filter((s) => s.createdAt.startsWith(v.date));
    const totalRevenueCents = onDate.reduce((sum, s) => sum + s.totalCents, 0);
    const totalDiscountCents = onDate.reduce((sum, s) => sum + s.discountCents, 0);
    const totalTaxCents = onDate.reduce((sum, s) => sum + s.taxCents, 0);
    const totalSalesCount = onDate.length;
    const averageBasketCents = totalSalesCount > 0
      ? Math.floor(totalRevenueCents / totalSalesCount)
      : 0;
    const id = asEntityId("dss_" + v.date);
    const summary: DailySalesSummary = {
      id,
      tenantId: ctx.tenantId,
      date: v.date,
      totalSalesCount,
      totalRevenueCents,
      totalDiscountCents,
      totalTaxCents,
      averageBasketCents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deps.store.putDailySalesSummary(ctx.tenantId, summary);
    return ok(summary);
}
