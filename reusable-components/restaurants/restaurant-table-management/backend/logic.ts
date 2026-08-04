/**
 * Business logic for the restaurant-table-management component.
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
  Table,
} from "./types";

import {
  type CreateTableInput,
  validateCreateTableInput,
  type AssignOrderToTableInput,
  validateAssignOrderToTableInput,
  type ReleaseTableInput,
  validateReleaseTableInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantTableManagementStore {
  getTable(tenantId: string, id: EntityId): Table | undefined;
  putTable(tenantId: string, entity: Table): void;
  listTables(tenantId: string): readonly Table[];
  deleteTable(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantTableManagementStore implements RestaurantTableManagementStore {
  private readonly tables = new Map<string, Map<string, Table>>();

  getTable(tenantId: string, id: EntityId): Table | undefined {
    return this.tables.get(tenantId)?.get(id);
  }
  putTable(tenantId: string, entity: Table): void {
    let byId = this.tables.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.tables.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listTables(tenantId: string): readonly Table[] {
    const byId = this.tables.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteTable(tenantId: string, id: EntityId): boolean {
    return this.tables.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantTableManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxTablesPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// createTable — Define a new table.
//////////////////////////////////////////////////////////////////////
export function createTable(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateTableInput
): Result<Table> {
  deps.permissions.require(ctx, asPermission("restaurant.tables.manage"));
  const validated = validateCreateTableInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const existing = deps.store.listTables(ctx.tenantId);
    if (existing.some((t) => t.label === v.label)) {
      return err(ErrorCode.CONFLICT, "table label already exists");
    }
    const id = asEntityId("tbl_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const table: Table = {
      id, tenantId: ctx.tenantId, label: v.label, seats: v.seats,
      status: "free", currentOrderId: null, createdAt: now, updatedAt: now,
    };
    deps.store.putTable(ctx.tenantId, table);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-table-management",
      action: "restaurant.table.created", entityType: "table", entityId: id,
      details: { label: v.label, seats: v.seats },
    }));
    return ok(table);
}

//////////////////////////////////////////////////////////////////////
// assignOrderToTable — Assign an order to a free table, marking the table as seated.
//////////////////////////////////////////////////////////////////////
export function assignOrderToTable(
  ctx: TenantContext,
  deps: Dependencies,
  input: AssignOrderToTableInput
): Result<Table> {
  deps.permissions.require(ctx, asPermission("restaurant.tables.assign"));
  const validated = validateAssignOrderToTableInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.tableId);
    const existing = deps.store.getTable(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "table not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "free") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "table is not free");
    }
    const updated: Table = {
      ...existing, status: "seated", currentOrderId: v.orderId,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putTable(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-table-management",
      action: "restaurant.table.assigned", entityType: "table", entityId: id,
      details: { orderId: v.orderId },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// releaseTable — Release a table after the order is served. Marks the table as dirty for cleaning.
//////////////////////////////////////////////////////////////////////
export function releaseTable(
  ctx: TenantContext,
  deps: Dependencies,
  input: ReleaseTableInput
): Result<Table> {
  deps.permissions.require(ctx, asPermission("restaurant.tables.assign"));
  const validated = validateReleaseTableInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.tableId);
    const existing = deps.store.getTable(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "table not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "seated") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only seated tables can be released");
    }
    const updated: Table = {
      ...existing, status: "dirty", currentOrderId: null,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putTable(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-table-management",
      action: "restaurant.table.released", entityType: "table", entityId: id, details: {},
    }));
    return ok(updated);
}
