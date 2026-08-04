/**
 * Business logic for the clinic-triage component.
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
  TriageEntry,
} from "./types";

import {
  type RecordTriageInput,
  validateRecordTriageInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicTriageStore {
  getTriageEntry(tenantId: string, id: EntityId): TriageEntry | undefined;
  putTriageEntry(tenantId: string, entity: TriageEntry): void;
  listTriageEntrys(tenantId: string): readonly TriageEntry[];
  deleteTriageEntry(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicTriageStore implements ClinicTriageStore {
  private readonly triageEntrys = new Map<string, Map<string, TriageEntry>>();

  getTriageEntry(tenantId: string, id: EntityId): TriageEntry | undefined {
    return this.triageEntrys.get(tenantId)?.get(id);
  }
  putTriageEntry(tenantId: string, entity: TriageEntry): void {
    let byId = this.triageEntrys.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.triageEntrys.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listTriageEntrys(tenantId: string): readonly TriageEntry[] {
    const byId = this.triageEntrys.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteTriageEntry(tenantId: string, id: EntityId): boolean {
    return this.triageEntrys.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicTriageStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly emergencyAutoNotify: boolean;
}

//////////////////////////////////////////////////////////////////////
// recordTriage — Record a triage entry at patient intake.
//////////////////////////////////////////////////////////////////////
export function recordTriage(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordTriageInput
): Result<TriageEntry> {
  deps.permissions.require(ctx, asPermission("clinic.triage.intake"));
  const validated = validateRecordTriageInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.symptomsJson) {
      try { JSON.parse(v.symptomsJson); } catch {
        return err(ErrorCode.INVALID_INPUT, "symptomsJson is not valid JSON");
      }
    }
    const id = asEntityId("tri_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const entry: TriageEntry = {
      id, tenantId: ctx.tenantId, patientId: v.patientId, visitReason: v.visitReason,
      symptomsJson: v.symptomsJson ?? null, urgency: v.urgency,
      classifiedByStaffId: ctx.userId, createdAt: now, updatedAt: now,
    };
    deps.store.putTriageEntry(ctx.tenantId, entry);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-triage",
      action: "clinic.triage.recorded", entityType: "triage_entry", entityId: id,
      details: { patientId: v.patientId, urgency: v.urgency },
    }));
    return ok(entry);
}

//////////////////////////////////////////////////////////////////////
// listEmergencyTriage — List all triage entries classified as emergency, newest first.
//////////////////////////////////////////////////////////////////////
export function listEmergencyTriage(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly TriageEntry[]> {
  deps.permissions.require(ctx, asPermission("clinic.triage.read"));
    const all = deps.store.listTriageEntrys(ctx.tenantId);
    const filtered = all.filter((t) => t.urgency === "emergency");
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(filtered);
}
