/**
 * Business logic for the document-management component.
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
  Document,
} from "./types";

import {
  type UploadDocumentInput,
  validateUploadDocumentInput,
  type ListDocumentsForEntityInput,
  validateListDocumentsForEntityInput,
  type SoftDeleteDocumentInput,
  validateSoftDeleteDocumentInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface DocumentManagementStore {
  getDocument(tenantId: string, id: EntityId): Document | undefined;
  putDocument(tenantId: string, entity: Document): void;
  listDocuments(tenantId: string): readonly Document[];
  deleteDocument(tenantId: string, id: EntityId): boolean;
}

export class InMemoryDocumentManagementStore implements DocumentManagementStore {
  private readonly documents = new Map<string, Map<string, Document>>();

  getDocument(tenantId: string, id: EntityId): Document | undefined {
    return this.documents.get(tenantId)?.get(id);
  }
  putDocument(tenantId: string, entity: Document): void {
    let byId = this.documents.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.documents.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listDocuments(tenantId: string): readonly Document[] {
    const byId = this.documents.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteDocument(tenantId: string, id: EntityId): boolean {
    return this.documents.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: DocumentManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxFileSizeBytes: number;
  readonly allowedMimeTypes: ReadonlyArray<string>;
  readonly retentionDaysAfterDelete: number;
  readonly tenantStorageQuotaBytes: number;
}

//////////////////////////////////////////////////////////////////////
// uploadDocument — Register an uploaded file. The actual bytes are assumed to be already stored by the platform's storage adapter; this operation records the metadata.
//////////////////////////////////////////////////////////////////////
export function uploadDocument(
  ctx: TenantContext,
  deps: Dependencies,
  input: UploadDocumentInput
): Result<Document> {
  deps.permissions.require(ctx, asPermission("documents.upload"));
  const validated = validateUploadDocumentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Quota check.
    const existing = deps.store.listDocuments(ctx.tenantId);
    const usedBytes = existing
      .filter((d) => d.deletedAt === null)
      .reduce((sum, d) => sum + d.sizeBytes, 0);
    if (usedBytes + v.sizeBytes > deps.config.tenantStorageQuotaBytes) {
      return err(ErrorCode.LIMIT_EXCEEDED, "tenant storage quota exceeded");
    }
    // MIME allow-list.
    if (!deps.config.allowedMimeTypes.includes(v.mimeType)) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "mimeType not allowed");
    }
    // Size cap.
    if (v.sizeBytes > deps.config.maxFileSizeBytes) {
      return err(ErrorCode.LIMIT_EXCEEDED, "file exceeds max size");
    }
    const id = asEntityId("doc_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const doc: Document = {
      id,
      tenantId: ctx.tenantId,
      fileName: v.fileName,
      mimeType: v.mimeType,
      sizeBytes: v.sizeBytes,
      storageKey: v.storageKey,
      entityType: v.entityType,
      entityId: v.entityId,
      kind: v.kind,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putDocument(ctx.tenantId, doc);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "document-management",
      action: "document.uploaded",
      entityType: "document",
      entityId: id,
      details: { fileName: v.fileName, mimeType: v.mimeType, sizeBytes: v.sizeBytes, attachedTo: `${v.entityType}/${v.entityId}` },
    }));
    return ok(doc);
}

//////////////////////////////////////////////////////////////////////
// listDocumentsForEntity — List all non-deleted documents attached to a specific entity.
//////////////////////////////////////////////////////////////////////
export function listDocumentsForEntity(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListDocumentsForEntityInput
): Result<readonly Document[]> {
  deps.permissions.require(ctx, asPermission("documents.read"));
  const validated = validateListDocumentsForEntityInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listDocuments(ctx.tenantId);
    const filtered = all.filter(
      (d) => d.deletedAt === null && d.entityType === v.entityType && d.entityId === v.entityId
    );
    return ok(filtered);
}

//////////////////////////////////////////////////////////////////////
// softDeleteDocument — Mark a document as soft-deleted. The bytes are retained until the retention window expires.
//////////////////////////////////////////////////////////////////////
export function softDeleteDocument(
  ctx: TenantContext,
  deps: Dependencies,
  input: SoftDeleteDocumentInput
): Result<Document> {
  deps.permissions.require(ctx, asPermission("documents.delete"));
  const validated = validateSoftDeleteDocumentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.documentId);
    const existing = deps.store.getDocument(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "document not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.deletedAt !== null) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "document already deleted");
    }
    const updated: Document = {
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deps.store.putDocument(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "document-management",
      action: "document.soft_deleted",
      entityType: "document",
      entityId: id,
      details: { fileName: existing.fileName },
    }));
    return ok(updated);
}
