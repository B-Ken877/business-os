/**
 * Business logic for the church-sermons component.
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
  Sermon,
} from "./types";

import {
  type RecordSermonInput,
  validateRecordSermonInput,
  type ListSermonsBySpeakerInput,
  validateListSermonsBySpeakerInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ChurchSermonsStore {
  getSermon(tenantId: string, id: EntityId): Sermon | undefined;
  putSermon(tenantId: string, entity: Sermon): void;
  listSermons(tenantId: string): readonly Sermon[];
  deleteSermon(tenantId: string, id: EntityId): boolean;
}

export class InMemoryChurchSermonsStore implements ChurchSermonsStore {
  private readonly sermons = new Map<string, Map<string, Sermon>>();

  getSermon(tenantId: string, id: EntityId): Sermon | undefined {
    return this.sermons.get(tenantId)?.get(id);
  }
  putSermon(tenantId: string, entity: Sermon): void {
    let byId = this.sermons.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.sermons.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listSermons(tenantId: string): readonly Sermon[] {
    const byId = this.sermons.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteSermon(tenantId: string, id: EntityId): boolean {
    return this.sermons.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ChurchSermonsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxSermonsPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// recordSermon — Record a new sermon.
//////////////////////////////////////////////////////////////////////
export function recordSermon(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordSermonInput
): Result<Sermon> {
  deps.permissions.require(ctx, asPermission("church.sermons.manage"));
  const validated = validateRecordSermonInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("srm_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const sermon: Sermon = {
      id, tenantId: ctx.tenantId, title: v.title, speakerMemberId: v.speakerMemberId,
      deliveredAt: v.deliveredAt, scriptureReferences: v.scriptureReferences ?? null,
      seriesId: v.seriesId ?? null, audioDocumentId: null, videoDocumentId: null,
      createdAt: now, updatedAt: now,
    };
    deps.store.putSermon(ctx.tenantId, sermon);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-sermons",
      action: "church.sermon.recorded", entityType: "sermon", entityId: id,
      details: { title: v.title, speakerMemberId: v.speakerMemberId, deliveredAt: v.deliveredAt },
    }));
    return ok(sermon);
}

//////////////////////////////////////////////////////////////////////
// listSermonsBySpeaker — List all sermons by a given speaker, newest first.
//////////////////////////////////////////////////////////////////////
export function listSermonsBySpeaker(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListSermonsBySpeakerInput
): Result<readonly Sermon[]> {
  deps.permissions.require(ctx, asPermission("church.sermons.read"));
  const validated = validateListSermonsBySpeakerInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listSermons(ctx.tenantId);
    const filtered = all.filter((s) => s.speakerMemberId === v.speakerMemberId);
    filtered.sort((a, b) => b.deliveredAt.localeCompare(a.deliveredAt));
    return ok(filtered);
}
