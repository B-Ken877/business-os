/**
 * Business logic for the clinic-prescriptions component.
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
  Prescription,
} from "./types";

import {
  type CreatePrescriptionInput,
  validateCreatePrescriptionInput,
  type RefillPrescriptionInput,
  validateRefillPrescriptionInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicPrescriptionsStore {
  getPrescription(tenantId: string, id: EntityId): Prescription | undefined;
  putPrescription(tenantId: string, entity: Prescription): void;
  listPrescriptions(tenantId: string): readonly Prescription[];
  deletePrescription(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicPrescriptionsStore implements ClinicPrescriptionsStore {
  private readonly prescriptions = new Map<string, Map<string, Prescription>>();

  getPrescription(tenantId: string, id: EntityId): Prescription | undefined {
    return this.prescriptions.get(tenantId)?.get(id);
  }
  putPrescription(tenantId: string, entity: Prescription): void {
    let byId = this.prescriptions.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.prescriptions.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listPrescriptions(tenantId: string): readonly Prescription[] {
    const byId = this.prescriptions.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deletePrescription(tenantId: string, id: EntityId): boolean {
    return this.prescriptions.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicPrescriptionsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxRefillsAllowed: number;
}

//////////////////////////////////////////////////////////////////////
// createPrescription — Create a new prescription.
//////////////////////////////////////////////////////////////////////
export function createPrescription(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreatePrescriptionInput
): Result<Prescription> {
  deps.permissions.require(ctx, asPermission("clinic.prescriptions.create"));
  const validated = validateCreatePrescriptionInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("rx_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const prescription: Prescription = {
      id, tenantId: ctx.tenantId, patientId: v.patientId, doctorStaffId: v.doctorStaffId,
      medicalRecordId: v.medicalRecordId ?? null, medicationName: v.medicationName,
      dosage: v.dosage, durationDays: v.durationDays,
      refillsRemaining: v.refillsRemaining, status: "active",
      createdAt: now, updatedAt: now,
    };
    deps.store.putPrescription(ctx.tenantId, prescription);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-prescriptions",
      action: "clinic.prescription.created", entityType: "prescription", entityId: id,
      details: { patientId: v.patientId, medicationName: v.medicationName, dosage: v.dosage },
    }));
    return ok(prescription);
}

//////////////////////////////////////////////////////////////////////
// refillPrescription — Refill a prescription. Decrements refillsRemaining; deactivates when 0.
//////////////////////////////////////////////////////////////////////
export function refillPrescription(
  ctx: TenantContext,
  deps: Dependencies,
  input: RefillPrescriptionInput
): Result<Prescription> {
  deps.permissions.require(ctx, asPermission("clinic.prescriptions.refill"));
  const validated = validateRefillPrescriptionInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.prescriptionId);
    const existing = deps.store.getPrescription(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "prescription not found");
    assertSameTenant(ctx, existing.tenantId);
    // Check refills BEFORE status, so an exhausted prescription returns
    // LIMIT_EXCEEDED (the more specific error).
    if (existing.refillsRemaining <= 0) {
      return err(ErrorCode.LIMIT_EXCEEDED, "no refills remaining");
    }
    if (existing.status !== "active") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "prescription is not active");
    }
    const newRefills = existing.refillsRemaining - 1;
    const updated: Prescription = {
      ...existing, refillsRemaining: newRefills,
      status: newRefills === 0 ? "exhausted" : "active",
      updatedAt: new Date().toISOString(),
    };
    deps.store.putPrescription(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-prescriptions",
      action: "clinic.prescription.refilled", entityType: "prescription", entityId: id,
      details: { refillsRemaining: newRefills },
    }));
    return ok(updated);
}
