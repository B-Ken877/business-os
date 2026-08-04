/**
 * Business logic for the school-tuition-management component.
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
  TuitionPlan,
  TuitionPayment,
} from "./types";

import {
  type CreateTuitionPlanInput,
  validateCreateTuitionPlanInput,
  type RecordTuitionPaymentInput,
  validateRecordTuitionPaymentInput,
  type ComputeOutstandingBalanceInput,
  validateComputeOutstandingBalanceInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolTuitionManagementStore {
  getTuitionPlan(tenantId: string, id: EntityId): TuitionPlan | undefined;
  putTuitionPlan(tenantId: string, entity: TuitionPlan): void;
  listTuitionPlans(tenantId: string): readonly TuitionPlan[];
  deleteTuitionPlan(tenantId: string, id: EntityId): boolean;
  getTuitionPayment(tenantId: string, id: EntityId): TuitionPayment | undefined;
  putTuitionPayment(tenantId: string, entity: TuitionPayment): void;
  listTuitionPayments(tenantId: string): readonly TuitionPayment[];
  deleteTuitionPayment(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolTuitionManagementStore implements SchoolTuitionManagementStore {
  private readonly tuitionPlans = new Map<string, Map<string, TuitionPlan>>();
  private readonly tuitionPayments = new Map<string, Map<string, TuitionPayment>>();

  getTuitionPlan(tenantId: string, id: EntityId): TuitionPlan | undefined {
    return this.tuitionPlans.get(tenantId)?.get(id);
  }
  putTuitionPlan(tenantId: string, entity: TuitionPlan): void {
    let byId = this.tuitionPlans.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.tuitionPlans.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listTuitionPlans(tenantId: string): readonly TuitionPlan[] {
    const byId = this.tuitionPlans.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteTuitionPlan(tenantId: string, id: EntityId): boolean {
    return this.tuitionPlans.get(tenantId)?.delete(id) ?? false;
  }

  getTuitionPayment(tenantId: string, id: EntityId): TuitionPayment | undefined {
    return this.tuitionPayments.get(tenantId)?.get(id);
  }
  putTuitionPayment(tenantId: string, entity: TuitionPayment): void {
    let byId = this.tuitionPayments.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.tuitionPayments.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listTuitionPayments(tenantId: string): readonly TuitionPayment[] {
    const byId = this.tuitionPayments.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteTuitionPayment(tenantId: string, id: EntityId): boolean {
    return this.tuitionPayments.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolTuitionManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultPlanInstallments: number;
}

//////////////////////////////////////////////////////////////////////
// createTuitionPlan — Create a tuition plan for a student.
//////////////////////////////////////////////////////////////////////
export function createTuitionPlan(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateTuitionPlanInput
): Result<TuitionPlan> {
  deps.permissions.require(ctx, asPermission("school.tuition.manage"));
  const validated = validateCreateTuitionPlanInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Validate installments sum to total.
    let installments: ReadonlyArray<{ dueDate: string; amountCents: number }>;
    try {
      const parsed = JSON.parse(v.installmentsJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return err(ErrorCode.INVALID_INPUT, "installments must be a non-empty array");
      }
      installments = parsed;
    } catch {
      return err(ErrorCode.INVALID_INPUT, "installmentsJson is not valid JSON");
    }
    const sum = installments.reduce((s, i) => s + i.amountCents, 0);
    if (sum !== v.totalAmountCents) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, `installments sum (${sum}) does not match total (${v.totalAmountCents})`);
    }
    // One plan per student.
    const existing = deps.store.listTuitionPlans(ctx.tenantId)
      .filter((p) => p.studentId === v.studentId);
    if (existing.length > 0) {
      return err(ErrorCode.CONFLICT, "student already has a tuition plan");
    }
    const id = asEntityId("plan_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const plan: TuitionPlan = {
      id, tenantId: ctx.tenantId, studentId: v.studentId,
      totalAmountCents: v.totalAmountCents, currency: v.currency,
      installmentsJson: v.installmentsJson, createdAt: now, updatedAt: now,
    };
    deps.store.putTuitionPlan(ctx.tenantId, plan);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-tuition-management",
      action: "school.tuition.plan_created", entityType: "tuition_plan", entityId: id,
      details: { studentId: v.studentId, totalAmountCents: v.totalAmountCents, installments: installments.length },
    }));
    return ok(plan);
}

//////////////////////////////////////////////////////////////////////
// recordTuitionPayment — Record a tuition payment against a plan.
//////////////////////////////////////////////////////////////////////
export function recordTuitionPayment(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordTuitionPaymentInput
): Result<TuitionPayment> {
  deps.permissions.require(ctx, asPermission("school.tuition.record_payment"));
  const validated = validateRecordTuitionPaymentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const plan = deps.store.getTuitionPlan(ctx.tenantId, asEntityId(v.planId));
    if (!plan) return err(ErrorCode.NOT_FOUND, "tuition plan not found");
    assertSameTenant(ctx, plan.tenantId);
    if (v.currency !== plan.currency) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "payment currency must match plan currency");
    }
    // Reject overpayment.
    const paidSoFar = deps.store.listTuitionPayments(ctx.tenantId)
      .filter((p) => p.planId === v.planId)
      .reduce((s, p) => s + p.amountCents, 0);
    if (paidSoFar + v.amountCents > plan.totalAmountCents) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "payment exceeds remaining balance");
    }
    const id = asEntityId("tpay_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const payment: TuitionPayment = {
      id, tenantId: ctx.tenantId, planId: v.planId, amountCents: v.amountCents,
      currency: v.currency, paymentReference: v.paymentReference ?? null,
      createdAt: now, updatedAt: now,
    };
    deps.store.putTuitionPayment(ctx.tenantId, payment);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-tuition-management",
      action: "school.tuition.payment_recorded", entityType: "tuition_payment", entityId: id,
      details: { planId: v.planId, amountCents: v.amountCents },
    }));
    return ok(payment);
}

//////////////////////////////////////////////////////////////////////
// computeOutstandingBalance — Compute the outstanding balance for a plan.
//////////////////////////////////////////////////////////////////////
export function computeOutstandingBalance(
  ctx: TenantContext,
  deps: Dependencies,
  input: ComputeOutstandingBalanceInput
): Result<{ totalAmountCents: number; paidAmountCents: number; outstandingCents: number }> {
  deps.permissions.require(ctx, asPermission("school.tuition.read"));
  const validated = validateComputeOutstandingBalanceInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const plan = deps.store.getTuitionPlan(ctx.tenantId, asEntityId(v.planId));
    if (!plan) return err(ErrorCode.NOT_FOUND, "tuition plan not found");
    const paid = deps.store.listTuitionPayments(ctx.tenantId)
      .filter((p) => p.planId === v.planId)
      .reduce((s, p) => s + p.amountCents, 0);
    return ok({
      totalAmountCents: plan.totalAmountCents,
      paidAmountCents: paid,
      outstandingCents: plan.totalAmountCents - paid,
    });
}
