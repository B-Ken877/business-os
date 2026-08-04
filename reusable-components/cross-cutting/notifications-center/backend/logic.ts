/**
 * Business logic for the notifications-center component.
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
  Notification,
} from "./types";

import {
  type PushNotificationInput,
  validatePushNotificationInput,
  type MarkReadInput,
  validateMarkReadInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface NotificationsCenterStore {
  getNotification(tenantId: string, id: EntityId): Notification | undefined;
  putNotification(tenantId: string, entity: Notification): void;
  listNotifications(tenantId: string): readonly Notification[];
  deleteNotification(tenantId: string, id: EntityId): boolean;
}

export class InMemoryNotificationsCenterStore implements NotificationsCenterStore {
  private readonly notifications = new Map<string, Map<string, Notification>>();

  getNotification(tenantId: string, id: EntityId): Notification | undefined {
    return this.notifications.get(tenantId)?.get(id);
  }
  putNotification(tenantId: string, entity: Notification): void {
    let byId = this.notifications.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.notifications.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listNotifications(tenantId: string): readonly Notification[] {
    const byId = this.notifications.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteNotification(tenantId: string, id: EntityId): boolean {
    return this.notifications.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: NotificationsCenterStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultExpiryHours: number;
  readonly maxPerUser: number;
}

//////////////////////////////////////////////////////////////////////
// pushNotification — Push a notification to a user's inbox.
//////////////////////////////////////////////////////////////////////
export function pushNotification(
  ctx: TenantContext,
  deps: Dependencies,
  input: PushNotificationInput
): Result<Notification> {
  deps.permissions.require(ctx, asPermission("notifications.push"));
  const validated = validatePushNotificationInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("ntf_" + Math.random().toString(36).slice(2, 10));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + deps.config.defaultExpiryHours * 3600 * 1000).toISOString();
    const notif: Notification = {
      id,
      tenantId: ctx.tenantId,
      recipientUserId: v.recipientUserId,
      title: v.title,
      body: v.body,
      actionLabel: v.actionLabel ?? null,
      actionUrl: v.actionUrl ?? null,
      readAt: null,
      dismissedAt: null,
      expiresAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    deps.store.putNotification(ctx.tenantId, notif);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "notifications-center",
      action: "notification.pushed",
      entityType: "notification",
      entityId: id,
      details: { recipientUserId: v.recipientUserId, title: v.title },
    }));
    return ok(notif);
}

//////////////////////////////////////////////////////////////////////
// listUnreadForCurrentUser — List all unread, non-expired, non-dismissed notifications for the current user.
//////////////////////////////////////////////////////////////////////
export function listUnreadForCurrentUser(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly Notification[]> {
  deps.permissions.require(ctx, asPermission("notifications.read"));
    const all = deps.store.listNotifications(ctx.tenantId);
    const now = new Date().toISOString();
    const filtered = all.filter(
      (n) =>
        n.recipientUserId === ctx.userId &&
        n.readAt === null &&
        n.dismissedAt === null &&
        n.expiresAt > now
    );
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(filtered);
}

//////////////////////////////////////////////////////////////////////
// markRead — Mark a notification as read.
//////////////////////////////////////////////////////////////////////
export function markRead(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkReadInput
): Result<Notification> {
  deps.permissions.require(ctx, asPermission("notifications.read"));
  const validated = validateMarkReadInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.notificationId);
    const existing = deps.store.getNotification(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "notification not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    // Only the recipient can mark their own notification read.
    if (existing.recipientUserId !== ctx.userId) {
      throw new PermissionDeniedError();
    }
    if (existing.readAt !== null) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "notification already read");
    }
    const updated: Notification = {
      ...existing,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deps.store.putNotification(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "notifications-center",
      action: "notification.read",
      entityType: "notification",
      entityId: id,
      details: {},
    }));
    return ok(updated);
}
