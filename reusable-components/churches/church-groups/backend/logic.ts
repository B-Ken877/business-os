/**
 * Business logic for the church-groups component.
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
  Group,
  GroupMembership,
} from "./types";

import {
  type CreateGroupInput,
  validateCreateGroupInput,
  type JoinGroupInput,
  validateJoinGroupInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ChurchGroupsStore {
  getGroup(tenantId: string, id: EntityId): Group | undefined;
  putGroup(tenantId: string, entity: Group): void;
  listGroups(tenantId: string): readonly Group[];
  deleteGroup(tenantId: string, id: EntityId): boolean;
  getGroupMembership(tenantId: string, id: EntityId): GroupMembership | undefined;
  putGroupMembership(tenantId: string, entity: GroupMembership): void;
  listGroupMemberships(tenantId: string): readonly GroupMembership[];
  deleteGroupMembership(tenantId: string, id: EntityId): boolean;
}

export class InMemoryChurchGroupsStore implements ChurchGroupsStore {
  private readonly groups = new Map<string, Map<string, Group>>();
  private readonly groupMemberships = new Map<string, Map<string, GroupMembership>>();

  getGroup(tenantId: string, id: EntityId): Group | undefined {
    return this.groups.get(tenantId)?.get(id);
  }
  putGroup(tenantId: string, entity: Group): void {
    let byId = this.groups.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.groups.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listGroups(tenantId: string): readonly Group[] {
    const byId = this.groups.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteGroup(tenantId: string, id: EntityId): boolean {
    return this.groups.get(tenantId)?.delete(id) ?? false;
  }

  getGroupMembership(tenantId: string, id: EntityId): GroupMembership | undefined {
    return this.groupMemberships.get(tenantId)?.get(id);
  }
  putGroupMembership(tenantId: string, entity: GroupMembership): void {
    let byId = this.groupMemberships.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.groupMemberships.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listGroupMemberships(tenantId: string): readonly GroupMembership[] {
    const byId = this.groupMemberships.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteGroupMembership(tenantId: string, id: EntityId): boolean {
    return this.groupMemberships.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ChurchGroupsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxGroupsPerTenant: number;
  readonly defaultMaxMembers: number;
}

//////////////////////////////////////////////////////////////////////
// createGroup — Create a new group.
//////////////////////////////////////////////////////////////////////
export function createGroup(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateGroupInput
): Result<Group> {
  deps.permissions.require(ctx, asPermission("church.groups.manage"));
  const validated = validateCreateGroupInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("grp_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const group: Group = {
      id, tenantId: ctx.tenantId, name: v.name, description: "",
      leaderMemberId: v.leaderMemberId, maxMembers: v.maxMembers,
      createdAt: now, updatedAt: now,
    };
    deps.store.putGroup(ctx.tenantId, group);
    // Auto-add the leader as a member with role 'leader'.
    const membership: GroupMembership = {
      id: asEntityId("gm_" + Math.random().toString(36).slice(2, 10)),
      tenantId: ctx.tenantId, groupId: id, memberId: v.leaderMemberId, role: "leader",
      createdAt: now, updatedAt: now,
    };
    deps.store.putGroupMembership(ctx.tenantId, membership);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-groups",
      action: "church.group.created", entityType: "group", entityId: id,
      details: { name: v.name, leaderMemberId: v.leaderMemberId },
    }));
    return ok(group);
}

//////////////////////////////////////////////////////////////////////
// joinGroup — Add a member to a group. Enforces max members.
//////////////////////////////////////////////////////////////////////
export function joinGroup(
  ctx: TenantContext,
  deps: Dependencies,
  input: JoinGroupInput
): Result<GroupMembership> {
  deps.permissions.require(ctx, asPermission("church.groups.join"));
  const validated = validateJoinGroupInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const group = deps.store.getGroup(ctx.tenantId, asEntityId(v.groupId));
    if (!group) return err(ErrorCode.NOT_FOUND, "group not found");
    assertSameTenant(ctx, group.tenantId);
    // Duplicate check.
    const existing = deps.store.listGroupMemberships(ctx.tenantId)
      .find((m) => m.groupId === v.groupId && m.memberId === v.memberId);
    if (existing) {
      return err(ErrorCode.CONFLICT, "member already in group");
    }
    // Capacity check.
    if (group.maxMembers > 0) {
      const count = deps.store.listGroupMemberships(ctx.tenantId)
        .filter((m) => m.groupId === v.groupId).length;
      if (count >= group.maxMembers) {
        return err(ErrorCode.LIMIT_EXCEEDED, "group at capacity");
      }
    }
    const id = asEntityId("gm_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const membership: GroupMembership = {
      id, tenantId: ctx.tenantId, groupId: v.groupId, memberId: v.memberId, role: "member",
      createdAt: now, updatedAt: now,
    };
    deps.store.putGroupMembership(ctx.tenantId, membership);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-groups",
      action: "church.group.joined", entityType: "group_membership", entityId: id,
      details: { groupId: v.groupId, memberId: v.memberId },
    }));
    return ok(membership);
}
