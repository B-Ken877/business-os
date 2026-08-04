import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryDocumentManagementStore,
  uploadDocument,
  listDocumentsForEntity,
  softDeleteDocument,
  defaultConfig,
  type Document,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryDocumentManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "documents.upload",
    "documents.read",
    "documents.delete",
    "documents.manageQuota",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("document-management / uploadDocument", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      uploadDocument(ctx, denyDeps, { fileName: "value", mimeType: "value", sizeBytes: 1, storageKey: "value", entityType: "value", entityId: "value", kind: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("document-management / listDocumentsForEntity", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listDocumentsForEntity(ctx, denyDeps, { entityType: "value", entityId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("document-management / softDeleteDocument", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      softDeleteDocument(ctx, denyDeps, { documentId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("document-management / uploadDocument happy path", () => {
  it("registers a document and records audit", () => {
    const { ctx, deps, audit } = setup();
    const r = uploadDocument(ctx, deps, {
      fileName: "report.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      storageKey: "s3://bucket/key",
      entityType: "invoice",
      entityId: "inv-1",
      kind: "attachment",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.fileName).toBe("report.pdf");
    expect(audit.filter((e) => e.action === "document.uploaded")).toHaveLength(1);
  });

  it("rejects disallowed MIME types", () => {
    const { ctx, deps } = setup();
    const r = uploadDocument(ctx, deps, {
      fileName: "evil.exe",
      mimeType: "application/x-msdownload",
      sizeBytes: 1024,
      storageKey: "s3://bucket/key",
      entityType: "invoice",
      entityId: "inv-1",
      kind: "attachment",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });

  it("rejects files exceeding the size cap", () => {
    const { ctx, deps } = setup();
    const r = uploadDocument(ctx, deps, {
      fileName: "huge.pdf",
      mimeType: "application/pdf",
      sizeBytes: 100 * 1024 * 1024,
      storageKey: "s3://bucket/key",
      entityType: "invoice",
      entityId: "inv-1",
      kind: "attachment",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("LIMIT_EXCEEDED");
  });
});

describe("document-management / softDeleteDocument rules", () => {
  it("soft-deletes a document", () => {
    const { ctx, deps } = setup();
    const up = uploadDocument(ctx, deps, {
      fileName: "report.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      storageKey: "s3://bucket/key",
      entityType: "invoice",
      entityId: "inv-1",
      kind: "attachment",
    });
    if (!up.ok) throw new Error("setup failed");
    const r = softDeleteDocument(ctx, deps, { documentId: up.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.deletedAt).not.toBeNull();
  });

  it("rejects double-delete", () => {
    const { ctx, deps } = setup();
    const up = uploadDocument(ctx, deps, {
      fileName: "report.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      storageKey: "s3://bucket/key",
      entityType: "invoice",
      entityId: "inv-1",
      kind: "attachment",
    });
    if (!up.ok) throw new Error("setup failed");
    softDeleteDocument(ctx, deps, { documentId: up.value.id });
    const r2 = softDeleteDocument(ctx, deps, { documentId: up.value.id });
    expect(isErr(r2)).toBe(true);
    if (!r2.ok) expect(r2.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
