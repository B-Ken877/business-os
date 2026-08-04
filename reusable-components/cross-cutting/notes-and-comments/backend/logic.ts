/**
 * Business logic for the notes-and-comments component.
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
  Note,
} from "./types";

import {
  type CreateNoteInput,
  validateCreateNoteInput,
  type ListNotesForEntityInput,
  validateListNotesForEntityInput,
  type DeleteNoteInput,
  validateDeleteNoteInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface NotesAndCommentsStore {
  getNote(tenantId: string, id: EntityId): Note | undefined;
  putNote(tenantId: string, entity: Note): void;
  listNotes(tenantId: string): readonly Note[];
  deleteNote(tenantId: string, id: EntityId): boolean;
}

export class InMemoryNotesAndCommentsStore implements NotesAndCommentsStore {
  private readonly notes = new Map<string, Map<string, Note>>();

  getNote(tenantId: string, id: EntityId): Note | undefined {
    return this.notes.get(tenantId)?.get(id);
  }
  putNote(tenantId: string, entity: Note): void {
    let byId = this.notes.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.notes.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listNotes(tenantId: string): readonly Note[] {
    const byId = this.notes.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteNote(tenantId: string, id: EntityId): boolean {
    return this.notes.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: NotesAndCommentsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxNoteLength: number;
  readonly maxThreadDepth: number;
}

//////////////////////////////////////////////////////////////////////
// createNote — Create a new note attached to an entity.
//////////////////////////////////////////////////////////////////////
export function createNote(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateNoteInput
): Result<Note> {
  deps.permissions.require(ctx, asPermission("notes.create"));
  const validated = validateCreateNoteInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.body.length > deps.config.maxNoteLength) {
      return err(ErrorCode.LIMIT_EXCEEDED, "note body exceeds max length");
    }
    let depth = 0;
    if (v.parentId) {
      const parent = deps.store.getNote(ctx.tenantId, asEntityId(v.parentId));
      if (!parent) {
        return err(ErrorCode.NOT_FOUND, "parent note not found");
      }
      assertSameTenant(ctx, parent.tenantId);
      // Compute depth by walking up the chain.
      let cursor: Note | undefined = parent;
      while (cursor && cursor.parentId) {
        depth++;
        const next = deps.store.getNote(ctx.tenantId, asEntityId(cursor.parentId));
        cursor = next;
        if (depth > deps.config.maxThreadDepth) {
          return err(ErrorCode.LIMIT_EXCEEDED, "thread depth exceeded");
        }
      }
      depth++;  // include the parent itself
      if (depth > deps.config.maxThreadDepth) {
        return err(ErrorCode.LIMIT_EXCEEDED, "thread depth exceeded");
      }
    }
    const id = asEntityId("note_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const note: Note = {
      id,
      tenantId: ctx.tenantId,
      body: v.body,
      entityType: v.entityType,
      entityId: v.entityId,
      parentId: v.parentId ?? null,
      visibility: v.visibility,
      editedAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putNote(ctx.tenantId, note);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "notes-and-comments",
      action: "note.created",
      entityType: "note",
      entityId: id,
      details: { attachedTo: `${v.entityType}/${v.entityId}`, visibility: v.visibility, depth },
    }));
    return ok(note);
}

//////////////////////////////////////////////////////////////////////
// listNotesForEntity — List all non-deleted notes attached to an entity.
//////////////////////////////////////////////////////////////////////
export function listNotesForEntity(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListNotesForEntityInput
): Result<readonly Note[]> {
  deps.permissions.require(ctx, asPermission("notes.read"));
  const validated = validateListNotesForEntityInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listNotes(ctx.tenantId);
    const filtered = all.filter(
      (n) => n.deletedAt === null && n.entityType === v.entityType && n.entityId === v.entityId
    );
    // Sort oldest-first so threads read top-down.
    filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return ok(filtered);
}

//////////////////////////////////////////////////////////////////////
// deleteNote — Soft-delete a note. Replies are not auto-deleted; they reference a deleted parent.
//////////////////////////////////////////////////////////////////////
export function deleteNote(
  ctx: TenantContext,
  deps: Dependencies,
  input: DeleteNoteInput
): Result<Note> {
  deps.permissions.require(ctx, asPermission("notes.delete"));
  const validated = validateDeleteNoteInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.noteId);
    const existing = deps.store.getNote(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "note not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.deletedAt !== null) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "note already deleted");
    }
    const updated: Note = {
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deps.store.putNote(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "notes-and-comments",
      action: "note.deleted",
      entityType: "note",
      entityId: id,
      details: {},
    }));
    return ok(updated);
}
