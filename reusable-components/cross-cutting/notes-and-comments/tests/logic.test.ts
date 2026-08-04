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
  InMemoryNotesAndCommentsStore,
  createNote,
  listNotesForEntity,
  deleteNote,
  defaultConfig,
  type Note,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryNotesAndCommentsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "notes.create",
    "notes.read",
    "notes.update",
    "notes.delete",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("notes-and-comments / createNote", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createNote(ctx, denyDeps, { body: "value", entityType: "value", entityId: "ent_test", parentId: undefined, visibility: "internal" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("notes-and-comments / listNotesForEntity", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listNotesForEntity(ctx, denyDeps, { entityType: "value", entityId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("notes-and-comments / deleteNote", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      deleteNote(ctx, denyDeps, { noteId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("notes-and-comments / createNote happy path", () => {
  it("creates a top-level note", () => {
    const { ctx, deps } = setup();
    const r = createNote(ctx, deps, {
      body: "Customer called about late payment.",
      entityType: "customer",
      entityId: "ent_test",
      visibility: "internal",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.body).toBe("Customer called about late payment.");
    expect(r.value.parentId).toBeNull();
  });

  it("rejects notes exceeding max length", () => {
    const { ctx, deps } = setup();
    const r = createNote(ctx, deps, {
      body: "x".repeat(6000),
      entityType: "customer",
      entityId: "ent_test",
      visibility: "internal",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("LIMIT_EXCEEDED");
  });

  it("rejects replies to non-existent parents", () => {
    const { ctx, deps } = setup();
    const r = createNote(ctx, deps, {
      body: "reply",
      entityType: "customer",
      entityId: "ent_test",
      parentId: "ent_missing",
      visibility: "internal",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });
});
