/**
 * Business logic for the clinic-medical-records component.
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
  MedicalRecord,
} from "./types";

import {
  type CreateRecordInput,
  validateCreateRecordInput,
  type ListRecordsForPatientInput,
  validateListRecordsForPatientInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicMedicalRecordsStore {
  getMedicalRecord(tenantId: string, id: EntityId): MedicalRecord | undefined;
  putMedicalRecord(tenantId: string, entity: MedicalRecord): void;
  listMedicalRecords(tenantId: string): readonly MedicalRecord[];
  deleteMedicalRecord(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicMedicalRecordsStore implements ClinicMedicalRecordsStore {
  private readonly medicalRecords = new Map<string, Map<string, MedicalRecord>>();

  getMedicalRecord(tenantId: string, id: EntityId): MedicalRecord | undefined {
    return this.medicalRecords.get(tenantId)?.get(id);
  }
  putMedicalRecord(tenantId: string, entity: MedicalRecord): void {
    let byId = this.medicalRecords.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.medicalRecords.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listMedicalRecords(tenantId: string): readonly MedicalRecord[] {
    const byId = this.medicalRecords.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteMedicalRecord(tenantId: string, id: EntityId): boolean {
    return this.medicalRecords.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicMedicalRecordsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxNotesLengthChars: number;
}

//////////////////////////////////////////////////////////////////////
// createRecord — Create a new medical record entry.
//////////////////////////////////////////////////////////////////////
export function createRecord(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateRecordInput
): Result<MedicalRecord> {
  deps.permissions.require(ctx, asPermission("clinic.records.create"));
  const validated = validateCreateRecordInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.consultationNotes.length > deps.config.maxNotesLengthChars) {
      return err(ErrorCode.LIMIT_EXCEEDED, "consultation notes exceed max length");
    }
    const id = asEntityId("mr_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const record: MedicalRecord = {
      id, tenantId: ctx.tenantId, patientId: v.patientId, doctorStaffId: v.doctorStaffId,
      appointmentId: v.appointmentId ?? null, consultationNotes: v.consultationNotes,
      diagnosis: v.diagnosis ?? null, treatmentPlan: v.treatmentPlan ?? null,
      createdAt: now, updatedAt: now,
    };
    deps.store.putMedicalRecord(ctx.tenantId, record);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-medical-records",
      action: "clinic.record.created", entityType: "medical_record", entityId: id,
      details: { patientId: v.patientId, doctorStaffId: v.doctorStaffId },
    }));
    return ok(record);
}

//////////////////////////////////////////////////////////////////////
// listRecordsForPatient — List all medical records for a patient. Every list call is audited.
//////////////////////////////////////////////////////////////////////
export function listRecordsForPatient(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListRecordsForPatientInput
): Result<readonly MedicalRecord[]> {
  deps.permissions.require(ctx, asPermission("clinic.records.read"));
  const validated = validateListRecordsForPatientInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listMedicalRecords(ctx.tenantId);
    const filtered = all.filter((r) => r.patientId === v.patientId);
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // Audit the list access — who looked at whose records.
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-medical-records",
      action: "clinic.records.listed_for_patient", entityType: "medical_record",
      entityId: v.patientId,
      details: { patientId: v.patientId, recordCount: filtered.length },
    }));
    return ok(filtered);
}
