/**
 * Business logic for the clinic-lab-orders component.
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
  LabOrder,
} from "./types";

import {
  type OrderLabTestInput,
  validateOrderLabTestInput,
  type RecordResultInput,
  validateRecordResultInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicLabOrdersStore {
  getLabOrder(tenantId: string, id: EntityId): LabOrder | undefined;
  putLabOrder(tenantId: string, entity: LabOrder): void;
  listLabOrders(tenantId: string): readonly LabOrder[];
  deleteLabOrder(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicLabOrdersStore implements ClinicLabOrdersStore {
  private readonly labOrders = new Map<string, Map<string, LabOrder>>();

  getLabOrder(tenantId: string, id: EntityId): LabOrder | undefined {
    return this.labOrders.get(tenantId)?.get(id);
  }
  putLabOrder(tenantId: string, entity: LabOrder): void {
    let byId = this.labOrders.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.labOrders.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listLabOrders(tenantId: string): readonly LabOrder[] {
    const byId = this.labOrders.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteLabOrder(tenantId: string, id: EntityId): boolean {
    return this.labOrders.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicLabOrdersStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultResultTurnaroundHours: number;
}

//////////////////////////////////////////////////////////////////////
// orderLabTest — Order a lab test for a patient.
//////////////////////////////////////////////////////////////////////
export function orderLabTest(
  ctx: TenantContext,
  deps: Dependencies,
  input: OrderLabTestInput
): Result<LabOrder> {
  deps.permissions.require(ctx, asPermission("clinic.lab.order"));
  const validated = validateOrderLabTestInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("lab_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const order: LabOrder = {
      id, tenantId: ctx.tenantId, patientId: v.patientId, doctorStaffId: v.doctorStaffId,
      testName: v.testName, status: "ordered", resultDocumentId: null,
      createdAt: now, updatedAt: now,
    };
    deps.store.putLabOrder(ctx.tenantId, order);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-lab-orders",
      action: "clinic.lab.ordered", entityType: "lab_order", entityId: id,
      details: { patientId: v.patientId, testName: v.testName },
    }));
    return ok(order);
}

//////////////////////////////////////////////////////////////////////
// recordResult — Record a result document for a lab order. Marks the order as completed.
//////////////////////////////////////////////////////////////////////
export function recordResult(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordResultInput
): Result<LabOrder> {
  deps.permissions.require(ctx, asPermission("clinic.lab.record_result"));
  const validated = validateRecordResultInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.labOrderId);
    const existing = deps.store.getLabOrder(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "lab order not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === "completed") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "lab order already completed");
    }
    if (existing.status === "cancelled") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "cannot record result for a cancelled order");
    }
    const updated: LabOrder = {
      ...existing, status: "completed", resultDocumentId: v.resultDocumentId,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putLabOrder(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-lab-orders",
      action: "clinic.lab.result_recorded", entityType: "lab_order", entityId: id,
      details: { resultDocumentId: v.resultDocumentId },
    }));
    return ok(updated);
}
