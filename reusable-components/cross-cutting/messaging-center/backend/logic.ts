/**
 * Business logic for the messaging-center component.
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
  Message,
} from "./types";

import {
  type SendMessageInput,
  validateSendMessageInput,
  type MarkDeliveredInput,
  validateMarkDeliveredInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface MessagingCenterStore {
  getMessage(tenantId: string, id: EntityId): Message | undefined;
  putMessage(tenantId: string, entity: Message): void;
  listMessages(tenantId: string): readonly Message[];
  deleteMessage(tenantId: string, id: EntityId): boolean;
}

export class InMemoryMessagingCenterStore implements MessagingCenterStore {
  private readonly messages = new Map<string, Map<string, Message>>();

  getMessage(tenantId: string, id: EntityId): Message | undefined {
    return this.messages.get(tenantId)?.get(id);
  }
  putMessage(tenantId: string, entity: Message): void {
    let byId = this.messages.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.messages.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listMessages(tenantId: string): readonly Message[] {
    const byId = this.messages.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteMessage(tenantId: string, id: EntityId): boolean {
    return this.messages.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: MessagingCenterStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultChannel: string;
  readonly maxBroadcastRecipients: number;
  readonly rateLimitPerMinute: number;
  readonly retryFailedDeliveries: boolean;
}

//////////////////////////////////////////////////////////////////////
// sendMessage — Send a message to a single recipient through a channel.
//////////////////////////////////////////////////////////////////////
export function sendMessage(
  ctx: TenantContext,
  deps: Dependencies,
  input: SendMessageInput
): Result<Message> {
  deps.permissions.require(ctx, asPermission("messaging.messages.send"));
  const validated = validateSendMessageInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("msg_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const message: Message = {
      id,
      tenantId: ctx.tenantId,
      recipientId: v.recipientId,
      channel: v.channel,
      templateKey: v.templateKey,
      variables: null,
      status: "queued",
      sentAt: null,
      deliveredAt: null,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putMessage(ctx.tenantId, message);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "messaging-center",
      action: "messaging.message.sent",
      entityType: "message",
      entityId: id,
      details: { recipientId: v.recipientId, channel: v.channel, templateKey: v.templateKey },
    }));
    return ok(message);
}

//////////////////////////////////////////////////////////////////////
// markDelivered — Mark a queued or sent message as delivered. Called by the channel adapter on delivery confirmation.
//////////////////////////////////////////////////////////////////////
export function markDelivered(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkDeliveredInput
): Result<Message> {
  deps.permissions.require(ctx, asPermission("messaging.messages.read"));
  const validated = validateMarkDeliveredInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.messageId);
    const existing = deps.store.getMessage(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "message not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === "delivered") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "message already delivered");
    }
    const updated: Message = {
      ...existing,
      status: "delivered",
      deliveredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deps.store.putMessage(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "messaging-center",
      action: "messaging.message.delivered",
      entityType: "message",
      entityId: id,
      details: { channel: existing.channel },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// listMessages — List all messages for the current tenant, newest first.
//////////////////////////////////////////////////////////////////////
export function listMessages(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly Message[]> {
  deps.permissions.require(ctx, asPermission("messaging.messages.read"));
    const list = deps.store.listMessages(ctx.tenantId);
    const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(sorted);
}
