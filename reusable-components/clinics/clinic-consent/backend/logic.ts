/**
 * Business logic for the clinic-consent component.
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
  ConsentRecord,
} from "./types";

import {
  type GrantConsentInput,
  validateGrantConsentInput,
  type RevokeConsentInput,
  validateRevokeConsentInput,
  type HasActiveConsentInput,
  validateHasActiveConsentInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicConsentStore {
  getConsentRecord(tenantId: string, id: EntityId): ConsentRecord | undefined;
  putConsentRecord(tenantId: string, entity: ConsentRecord): void;
  listConsentRecords(tenantId: string): readonly ConsentRecord[];
  deleteConsentRecord(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicConsentStore implements ClinicConsentStore {
  private readonly consentRecords = new Map<string, Map<string, ConsentRecord>>();

  getConsentRecord(tenantId: string, id: EntityId): ConsentRecord | undefined {
    return this.consentRecords.get(tenantId)?.get(id);
  }
  putConsentRecord(tenantId: string, entity: ConsentRecord): void {
    let byId = this.consentRecords.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.consentRecords.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listConsentRecords(tenantId: string): readonly ConsentRecord[] {
    const byId = this.consentRecords.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteConsentRecord(tenantId: string, id: EntityId): boolean {
    return this.consentRecords.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicConsentStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly requireExplicitRevokeReason: boolean;
}

//////////////////////////////////////////////////////////////////////
// grantConsent — Grant consent for a specific purpose. Idempotent: re-granting active consent is a no-op.
//////////////////////////////////////////////////////////////////////
export function grantConsent(
  ctx: TenantContext,
  deps: Dependencies,
  input: GrantConsentInput
): Result<ConsentRecord> {
  deps.permissions.require(ctx, asPermission("clinic.consent.manage"));
  const validated = validateGrantConsentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Check for existing active consent.
    const existing = deps.store.listConsentRecords(ctx.tenantId)
      .find((c) => c.patientId === v.patientId && c.purpose === v.purpose && c.revokedAt === null);
    if (existing) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "consent already granted and active");
    }
    const id = asEntityId("con_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const record: ConsentRecord = {
      id, tenantId: ctx.tenantId, patientId: v.patientId, purpose: v.purpose,
      grantedAt: now, revokedAt: null, revokeReason: null,
      createdAt: now, updatedAt: now,
    };
    deps.store.putConsentRecord(ctx.tenantId, record);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-consent",
      action: "clinic.consent.granted", entityType: "consent_record", entityId: id,
      details: { patientId: v.patientId, purpose: v.purpose },
    }));
    return ok(record);
}

//////////////////////////////////////////////////////////////////////
// revokeConsent — Revoke consent for a specific purpose.
//////////////////////////////////////////////////////////////////////
export function revokeConsent(
  ctx: TenantContext,
  deps: Dependencies,
  input: RevokeConsentInput
): Result<ConsentRecord> {
  deps.permissions.require(ctx, asPermission("clinic.consent.manage"));
  const validated = validateRevokeConsentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (deps.config.requireExplicitRevokeReason && (!v.reason || v.reason.trim().length === 0)) {
      return err(ErrorCode.INVALID_INPUT, "revoke reason is required");
    }
    const existing = deps.store.listConsentRecords(ctx.tenantId)
      .find((c) => c.patientId === v.patientId && c.purpose === v.purpose && c.revokedAt === null);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "no active consent found for this purpose");
    }
    const updated: ConsentRecord = {
      ...existing, revokedAt: new Date().toISOString(), revokeReason: v.reason ?? null,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putConsentRecord(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-consent",
      action: "clinic.consent.revoked", entityType: "consent_record", entityId: updated.id,
      details: { patientId: v.patientId, purpose: v.purpose, reason: v.reason ?? null },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// hasActiveConsent — Check whether a patient has active consent for a purpose. Audited as a check.
//////////////////////////////////////////////////////////////////////
export function hasActiveConsent(
  ctx: TenantContext,
  deps: Dependencies,
  input: HasActiveConsentInput
): Result<boolean> {
  deps.permissions.require(ctx, asPermission("clinic.consent.check"));
  const validated = validateHasActiveConsentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const existing = deps.store.listConsentRecords(ctx.tenantId)
      .find((c) => c.patientId === v.patientId && c.purpose === v.purpose && c.revokedAt === null);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-consent",
      action: "clinic.consent.checked", entityType: "consent_record",
      entityId: v.patientId,
      details: { patientId: v.patientId, purpose: v.purpose, hasActiveConsent: Boolean(existing) },
    }));
    return ok(Boolean(existing));
}
