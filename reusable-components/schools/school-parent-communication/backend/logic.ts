/**
 * Business logic for the school-parent-communication component.
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
  ParentMessage,
} from "./types";

import {
  type SendParentMessageInput,
  validateSendParentMessageInput,
  type ListMessagesForStudentInput,
  validateListMessagesForStudentInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolParentCommunicationStore {
  getParentMessage(tenantId: string, id: EntityId): ParentMessage | undefined;
  putParentMessage(tenantId: string, entity: ParentMessage): void;
  listParentMessages(tenantId: string): readonly ParentMessage[];
  deleteParentMessage(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolParentCommunicationStore implements SchoolParentCommunicationStore {
  private readonly parentMessages = new Map<string, Map<string, ParentMessage>>();

  getParentMessage(tenantId: string, id: EntityId): ParentMessage | undefined {
    return this.parentMessages.get(tenantId)?.get(id);
  }
  putParentMessage(tenantId: string, entity: ParentMessage): void {
    let byId = this.parentMessages.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.parentMessages.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listParentMessages(tenantId: string): readonly ParentMessage[] {
    const byId = this.parentMessages.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteParentMessage(tenantId: string, id: EntityId): boolean {
    return this.parentMessages.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolParentCommunicationStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly broadcastRateLimitPerHour: number;
}

//////////////////////////////////////////////////////////////////////
// sendParentMessage — Send a message to a student's parent.
//////////////////////////////////////////////////////////////////////
export function sendParentMessage(
  ctx: TenantContext,
  deps: Dependencies,
  input: SendParentMessageInput
): Result<ParentMessage> {
  deps.permissions.require(ctx, asPermission("school.parent_comm.send"));
  const validated = validateSendParentMessageInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("pm_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const msg: ParentMessage = {
      id, tenantId: ctx.tenantId, studentId: v.studentId,
      subject: v.subject, body: v.body, direction: "outbound",
      messagingMessageId: null, createdAt: now, updatedAt: now,
    };
    deps.store.putParentMessage(ctx.tenantId, msg);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-parent-communication",
      action: "school.parent_message.sent", entityType: "parent_message", entityId: id,
      details: { studentId: v.studentId, subject: v.subject },
    }));
    return ok(msg);
}

//////////////////////////////////////////////////////////////////////
// listMessagesForStudent — List all messages for a student's parent, newest first.
//////////////////////////////////////////////////////////////////////
export function listMessagesForStudent(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListMessagesForStudentInput
): Result<readonly ParentMessage[]> {
  deps.permissions.require(ctx, asPermission("school.parent_comm.read"));
  const validated = validateListMessagesForStudentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listParentMessages(ctx.tenantId);
    const filtered = all.filter((m) => m.studentId === v.studentId);
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(filtered);
}
