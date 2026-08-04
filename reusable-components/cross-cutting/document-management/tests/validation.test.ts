import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateUploadDocumentInput,
  type UploadDocumentInput,
  validateListDocumentsForEntityInput,
  type ListDocumentsForEntityInput,
  validateSoftDeleteDocumentInput,
  type SoftDeleteDocumentInput,
} from "../backend/validation";

describe("document-management / validateUploadDocumentInput", () => {
  it("accepts a valid input", () => {
    const input: UploadDocumentInput = {
    fileName: "value",
    mimeType: "value",
    sizeBytes: 1,
    storageKey: "value",
    entityType: "value",
    entityId: "value",
    kind: "value",
    };
    const r = validateUploadDocumentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when fileName is missing", () => {
    const input = {
      mimeType: "value",
      sizeBytes: 1,
      storageKey: "value",
      entityType: "value",
      entityId: "value",
      kind: "value",
    } as any;
    const r = validateUploadDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when mimeType is missing", () => {
    const input = {
      fileName: "value",
      sizeBytes: 1,
      storageKey: "value",
      entityType: "value",
      entityId: "value",
      kind: "value",
    } as any;
    const r = validateUploadDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sizeBytes is missing", () => {
    const input = {
      fileName: "value",
      mimeType: "value",
      storageKey: "value",
      entityType: "value",
      entityId: "value",
      kind: "value",
    } as any;
    const r = validateUploadDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when storageKey is missing", () => {
    const input = {
      fileName: "value",
      mimeType: "value",
      sizeBytes: 1,
      entityType: "value",
      entityId: "value",
      kind: "value",
    } as any;
    const r = validateUploadDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityType is missing", () => {
    const input = {
      fileName: "value",
      mimeType: "value",
      sizeBytes: 1,
      storageKey: "value",
      entityId: "value",
      kind: "value",
    } as any;
    const r = validateUploadDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityId is missing", () => {
    const input = {
      fileName: "value",
      mimeType: "value",
      sizeBytes: 1,
      storageKey: "value",
      entityType: "value",
      kind: "value",
    } as any;
    const r = validateUploadDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when kind is missing", () => {
    const input = {
      fileName: "value",
      mimeType: "value",
      sizeBytes: 1,
      storageKey: "value",
      entityType: "value",
      entityId: "value",
    } as any;
    const r = validateUploadDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sizeBytes violates positive-integer", () => {
    const input = {
      fileName: "value",
      mimeType: "value",
      sizeBytes: -1,
      storageKey: "value",
      entityType: "value",
      entityId: "value",
      kind: "value",
    } as any;
    const r = validateUploadDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("document-management / validateListDocumentsForEntityInput", () => {
  it("accepts a valid input", () => {
    const input: ListDocumentsForEntityInput = {
    entityType: "value",
    entityId: "ent_test",
    };
    const r = validateListDocumentsForEntityInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when entityType is missing", () => {
    const input = {
      entityId: "ent_test",
    } as any;
    const r = validateListDocumentsForEntityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityId is missing", () => {
    const input = {
      entityType: "value",
    } as any;
    const r = validateListDocumentsForEntityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("document-management / validateSoftDeleteDocumentInput", () => {
  it("accepts a valid input", () => {
    const input: SoftDeleteDocumentInput = {
    documentId: "ent_test",
    };
    const r = validateSoftDeleteDocumentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when documentId is missing", () => {
    const input = {
    } as any;
    const r = validateSoftDeleteDocumentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
