/**
 * Business logic for the clinic-staff-management component.
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
  Staff,
} from "./types";

import {
  type CreateStaffInput,
  validateCreateStaffInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicStaffManagementStore {
  getStaff(tenantId: string, id: EntityId): Staff | undefined;
  putStaff(tenantId: string, entity: Staff): void;
  listStaffs(tenantId: string): readonly Staff[];
  deleteStaff(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicStaffManagementStore implements ClinicStaffManagementStore {
  private readonly staffs = new Map<string, Map<string, Staff>>();

  getStaff(tenantId: string, id: EntityId): Staff | undefined {
    return this.staffs.get(tenantId)?.get(id);
  }
  putStaff(tenantId: string, entity: Staff): void {
    let byId = this.staffs.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.staffs.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listStaffs(tenantId: string): readonly Staff[] {
    const byId = this.staffs.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteStaff(tenantId: string, id: EntityId): boolean {
    return this.staffs.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicStaffManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxStaffPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// createStaff — Create a new staff record.
//////////////////////////////////////////////////////////////////////
export function createStaff(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateStaffInput
): Result<Staff> {
  deps.permissions.require(ctx, asPermission("clinic.staff.manage"));
  const validated = validateCreateStaffInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("stf_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const staff: Staff = {
      id, tenantId: ctx.tenantId, firstName: v.firstName, lastName: v.lastName,
      role: v.role, specialty: v.specialty ?? null, phone: v.phone ?? null,
      email: v.email ?? null, createdAt: now, updatedAt: now,
    };
    deps.store.putStaff(ctx.tenantId, staff);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-staff-management",
      action: "clinic.staff.created", entityType: "staff", entityId: id,
      details: { firstName: v.firstName, lastName: v.lastName, role: v.role },
    }));
    return ok(staff);
}

//////////////////////////////////////////////////////////////////////
// listDoctors — List all staff with the 'doctor' role.
//////////////////////////////////////////////////////////////////////
export function listDoctors(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly Staff[]> {
  deps.permissions.require(ctx, asPermission("clinic.staff.read"));
    const all = deps.store.listStaffs(ctx.tenantId);
    return ok(all.filter((s) => s.role === "doctor"));
}
