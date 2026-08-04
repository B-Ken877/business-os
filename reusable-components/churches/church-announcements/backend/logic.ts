/**
 * Business logic for the church-announcements component.
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
  Announcement,
} from "./types";

import {
  type PublishAnnouncementInput,
  validatePublishAnnouncementInput,
  type ListActiveAnnouncementsInput,
  validateListActiveAnnouncementsInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ChurchAnnouncementsStore {
  getAnnouncement(tenantId: string, id: EntityId): Announcement | undefined;
  putAnnouncement(tenantId: string, entity: Announcement): void;
  listAnnouncements(tenantId: string): readonly Announcement[];
  deleteAnnouncement(tenantId: string, id: EntityId): boolean;
}

export class InMemoryChurchAnnouncementsStore implements ChurchAnnouncementsStore {
  private readonly announcements = new Map<string, Map<string, Announcement>>();

  getAnnouncement(tenantId: string, id: EntityId): Announcement | undefined {
    return this.announcements.get(tenantId)?.get(id);
  }
  putAnnouncement(tenantId: string, entity: Announcement): void {
    let byId = this.announcements.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.announcements.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listAnnouncements(tenantId: string): readonly Announcement[] {
    const byId = this.announcements.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteAnnouncement(tenantId: string, id: EntityId): boolean {
    return this.announcements.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ChurchAnnouncementsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultExpiryDays: number;
}

//////////////////////////////////////////////////////////////////////
// publishAnnouncement — Publish a new announcement.
//////////////////////////////////////////////////////////////////////
export function publishAnnouncement(
  ctx: TenantContext,
  deps: Dependencies,
  input: PublishAnnouncementInput
): Result<Announcement> {
  deps.permissions.require(ctx, asPermission("church.announcements.publish"));
  const validated = validatePublishAnnouncementInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("ann_" + Math.random().toString(36).slice(2, 10));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + deps.config.defaultExpiryDays * 24 * 3600 * 1000).toISOString();
    const announcement: Announcement = {
      id, tenantId: ctx.tenantId, title: v.title, body: v.body,
      audience: v.audience, expiresAt, status: "published",
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    };
    deps.store.putAnnouncement(ctx.tenantId, announcement);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-announcements",
      action: "church.announcement.published", entityType: "announcement", entityId: id,
      details: { title: v.title, audience: v.audience },
    }));
    return ok(announcement);
}

//////////////////////////////////////////////////////////////////////
// listActiveAnnouncements — List all non-expired announcements for a given audience, newest first.
//////////////////////////////////////////////////////////////////////
export function listActiveAnnouncements(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListActiveAnnouncementsInput
): Result<readonly Announcement[]> {
  deps.permissions.require(ctx, asPermission("church.announcements.read"));
  const validated = validateListActiveAnnouncementsInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const now = new Date().toISOString();
    const all = deps.store.listAnnouncements(ctx.tenantId);
    const filtered = all.filter(
      (a) => a.status === "published" && a.audience === v.audience && a.expiresAt > now
    );
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(filtered);
}
