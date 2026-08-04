/**
 * Business logic for the church-member-management component.
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
  Member,
} from "./types";

import {
  type CreateMemberInput,
  validateCreateMemberInput,
  type UpdateOwnVisibilityInput,
  validateUpdateOwnVisibilityInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ChurchMemberManagementStore {
  getMember(tenantId: string, id: EntityId): Member | undefined;
  putMember(tenantId: string, entity: Member): void;
  listMembers(tenantId: string): readonly Member[];
  deleteMember(tenantId: string, id: EntityId): boolean;
}

export class InMemoryChurchMemberManagementStore implements ChurchMemberManagementStore {
  private readonly members = new Map<string, Map<string, Member>>();

  getMember(tenantId: string, id: EntityId): Member | undefined {
    return this.members.get(tenantId)?.get(id);
  }
  putMember(tenantId: string, entity: Member): void {
    let byId = this.members.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.members.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listMembers(tenantId: string): readonly Member[] {
    const byId = this.members.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteMember(tenantId: string, id: EntityId): boolean {
    return this.members.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ChurchMemberManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultDirectoryVisibility: string;
  readonly maxMembersPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// createMember — Create a new member record.
//////////////////////////////////////////////////////////////////////
export function createMember(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateMemberInput
): Result<Member> {
  deps.permissions.require(ctx, asPermission("church.members.manage"));
  const validated = validateCreateMemberInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("mem_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const member: Member = {
      id, tenantId: ctx.tenantId, firstName: v.firstName, lastName: v.lastName,
      phone: v.phone ?? null, email: v.email ?? null,
      familyId: v.familyId ?? null, membershipStatus: "active",
      directoryVisibility: v.directoryVisibility, createdAt: now, updatedAt: now,
    };
    deps.store.putMember(ctx.tenantId, member);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-member-management",
      action: "church.member.created", entityType: "member", entityId: id,
      details: { firstName: v.firstName, lastName: v.lastName },
    }));
    return ok(member);
}

//////////////////////////////////////////////////////////////////////
// listVisibleMembers — List all members whose directory visibility is 'visible' and whose status is 'active'.
//////////////////////////////////////////////////////////////////////
export function listVisibleMembers(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly Member[]> {
  deps.permissions.require(ctx, asPermission("church.members.read"));
    const all = deps.store.listMembers(ctx.tenantId);
    const filtered = all.filter((m) => m.directoryVisibility === "visible" && m.membershipStatus === "active");
    return ok(filtered);
}

//////////////////////////////////////////////////////////////////////
// updateOwnVisibility — A member updates their own directory visibility. The caller's userId must match the member's id (enforced by the orchestrator).
//////////////////////////////////////////////////////////////////////
export function updateOwnVisibility(
  ctx: TenantContext,
  deps: Dependencies,
  input: UpdateOwnVisibilityInput
): Result<Member> {
  deps.permissions.require(ctx, asPermission("church.members.update_own"));
  const validated = validateUpdateOwnVisibilityInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.memberId);
    const existing = deps.store.getMember(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "member not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.directoryVisibility === v.visibility) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "visibility already set to this value");
    }
    const updated: Member = {
      ...existing, directoryVisibility: v.visibility, updatedAt: new Date().toISOString(),
    };
    deps.store.putMember(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-member-management",
      action: "church.member.visibility_updated", entityType: "member", entityId: id,
      details: { from: existing.directoryVisibility, to: v.visibility },
    }));
    return ok(updated);
}
