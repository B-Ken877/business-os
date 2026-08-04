/**
 * Business logic for the clinic-patient-management component.
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
  Patient,
} from "./types";

import {
  type CreatePatientInput,
  validateCreatePatientInput,
  type GetPatientInput,
  validateGetPatientInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicPatientManagementStore {
  getPatient(tenantId: string, id: EntityId): Patient | undefined;
  putPatient(tenantId: string, entity: Patient): void;
  listPatients(tenantId: string): readonly Patient[];
  deletePatient(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicPatientManagementStore implements ClinicPatientManagementStore {
  private readonly patients = new Map<string, Map<string, Patient>>();

  getPatient(tenantId: string, id: EntityId): Patient | undefined {
    return this.patients.get(tenantId)?.get(id);
  }
  putPatient(tenantId: string, entity: Patient): void {
    let byId = this.patients.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.patients.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listPatients(tenantId: string): readonly Patient[] {
    const byId = this.patients.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deletePatient(tenantId: string, id: EntityId): boolean {
    return this.patients.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicPatientManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly requireDateOfBirth: boolean;
  readonly maxPatientsPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// createPatient — Create a new patient record. The medicalRecordNumber must be unique per tenant.
//////////////////////////////////////////////////////////////////////
export function createPatient(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreatePatientInput
): Result<Patient> {
  deps.permissions.require(ctx, asPermission("clinic.patients.create"));
  const validated = validateCreatePatientInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // MRN uniqueness per tenant.
    const existing = deps.store.listPatients(ctx.tenantId);
    if (existing.some((p) => p.medicalRecordNumber === v.medicalRecordNumber)) {
      return err(ErrorCode.CONFLICT, "medical record number already exists");
    }
    const id = asEntityId("pat_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const patient: Patient = {
      id, tenantId: ctx.tenantId, firstName: v.firstName, lastName: v.lastName,
      dateOfBirth: v.dateOfBirth, phone: v.phone ?? null, email: v.email ?? null,
      address: v.address ?? null, medicalRecordNumber: v.medicalRecordNumber,
      createdAt: now, updatedAt: now,
    };
    deps.store.putPatient(ctx.tenantId, patient);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-patient-management",
      action: "clinic.patient.created", entityType: "patient", entityId: id,
      details: { firstName: v.firstName, lastName: v.lastName, medicalRecordNumber: v.medicalRecordNumber },
    }));
    return ok(patient);
}

//////////////////////////////////////////////////////////////////////
// getPatient — Retrieve a patient by id. Every read is audited — see security-rules.md §5.
//////////////////////////////////////////////////////////////////////
export function getPatient(
  ctx: TenantContext,
  deps: Dependencies,
  input: GetPatientInput
): Result<Patient> {
  deps.permissions.require(ctx, asPermission("clinic.patients.read"));
  const validated = validateGetPatientInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.patientId);
    const patient = deps.store.getPatient(ctx.tenantId, id);
    if (!patient) return err(ErrorCode.NOT_FOUND, "patient not found");
    assertSameTenant(ctx, patient.tenantId);
    // Audit the READ itself — who looked at which patient, when.
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-patient-management",
      action: "clinic.patient.read", entityType: "patient", entityId: id,
      details: { medicalRecordNumber: patient.medicalRecordNumber },
    }));
    return ok(patient);
}
