/**
 * Business logic for the school-certificates component.
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
  Certificate,
} from "./types";

import {
  type IssueCertificateInput,
  validateIssueCertificateInput,
  type RevokeCertificateInput,
  validateRevokeCertificateInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolCertificatesStore {
  getCertificate(tenantId: string, id: EntityId): Certificate | undefined;
  putCertificate(tenantId: string, entity: Certificate): void;
  listCertificates(tenantId: string): readonly Certificate[];
  deleteCertificate(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolCertificatesStore implements SchoolCertificatesStore {
  private readonly certificates = new Map<string, Map<string, Certificate>>();

  getCertificate(tenantId: string, id: EntityId): Certificate | undefined {
    return this.certificates.get(tenantId)?.get(id);
  }
  putCertificate(tenantId: string, entity: Certificate): void {
    let byId = this.certificates.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.certificates.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listCertificates(tenantId: string): readonly Certificate[] {
    const byId = this.certificates.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteCertificate(tenantId: string, id: EntityId): boolean {
    return this.certificates.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolCertificatesStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly certificateTemplateKey: string;
}

//////////////////////////////////////////////////////////////////////
// issueCertificate — Issue a new certificate to a student.
//////////////////////////////////////////////////////////////////////
export function issueCertificate(
  ctx: TenantContext,
  deps: Dependencies,
  input: IssueCertificateInput
): Result<Certificate> {
  deps.permissions.require(ctx, asPermission("school.certificates.issue"));
  const validated = validateIssueCertificateInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Uniqueness of certificate number per tenant.
    const existing = deps.store.listCertificates(ctx.tenantId);
    if (existing.some((c) => c.certificateNumber === v.certificateNumber)) {
      return err(ErrorCode.CONFLICT, "certificate number already exists");
    }
    const id = asEntityId("cert_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const cert: Certificate = {
      id, tenantId: ctx.tenantId, studentId: v.studentId,
      programName: v.programName, certificateNumber: v.certificateNumber,
      issuedAt: now, pdfDocumentId: null, status: "issued",
      createdAt: now, updatedAt: now,
    };
    deps.store.putCertificate(ctx.tenantId, cert);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-certificates",
      action: "school.certificate.issued", entityType: "certificate", entityId: id,
      details: { studentId: v.studentId, programName: v.programName, certificateNumber: v.certificateNumber },
    }));
    return ok(cert);
}

//////////////////////////////////////////////////////////////////////
// revokeCertificate — Revoke a certificate (e.g. due to academic dishonesty).
//////////////////////////////////////////////////////////////////////
export function revokeCertificate(
  ctx: TenantContext,
  deps: Dependencies,
  input: RevokeCertificateInput
): Result<Certificate> {
  deps.permissions.require(ctx, asPermission("school.certificates.revoke"));
  const validated = validateRevokeCertificateInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.certificateId);
    const existing = deps.store.getCertificate(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "certificate not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "issued") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only issued certificates can be revoked");
    }
    const updated: Certificate = {
      ...existing, status: "revoked", updatedAt: new Date().toISOString(),
    };
    deps.store.putCertificate(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-certificates",
      action: "school.certificate.revoked", entityType: "certificate", entityId: id,
      details: { certificateNumber: existing.certificateNumber },
    }));
    return ok(updated);
}
