/**
 * Business logic for the retail-promotions component.
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
  Promotion,
} from "./types";

import {
  type CreatePromotionInput,
  validateCreatePromotionInput,
  type ActivatePromotionInput,
  validateActivatePromotionInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailPromotionsStore {
  getPromotion(tenantId: string, id: EntityId): Promotion | undefined;
  putPromotion(tenantId: string, entity: Promotion): void;
  listPromotions(tenantId: string): readonly Promotion[];
  deletePromotion(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailPromotionsStore implements RetailPromotionsStore {
  private readonly promotions = new Map<string, Map<string, Promotion>>();

  getPromotion(tenantId: string, id: EntityId): Promotion | undefined {
    return this.promotions.get(tenantId)?.get(id);
  }
  putPromotion(tenantId: string, entity: Promotion): void {
    let byId = this.promotions.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.promotions.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listPromotions(tenantId: string): readonly Promotion[] {
    const byId = this.promotions.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deletePromotion(tenantId: string, id: EntityId): boolean {
    return this.promotions.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailPromotionsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxActivePromotionsPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// createPromotion — Create a new promotion in draft status.
//////////////////////////////////////////////////////////////////////
export function createPromotion(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreatePromotionInput
): Result<Promotion> {
  deps.permissions.require(ctx, asPermission("retail.promotions.create"));
  const validated = validateCreatePromotionInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.startsAt >= v.endsAt) {
      return err(ErrorCode.INVALID_INPUT, "startsAt must be before endsAt");
    }
    if (v.discountType === "percentage" && v.discountValue > 10000) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "percentage discount cannot exceed 100%");
    }
    try {
      const parsed = JSON.parse(v.scopeJson);
      if (!Array.isArray(parsed)) {
        return err(ErrorCode.INVALID_INPUT, "scopeJson must be a JSON array");
      }
    } catch {
      return err(ErrorCode.INVALID_INPUT, "scopeJson is not valid JSON");
    }
    const id = asEntityId("promo_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const promotion: Promotion = {
      id,
      tenantId: ctx.tenantId,
      name: v.name,
      discountType: v.discountType,
      discountValue: v.discountValue,
      scopeJson: v.scopeJson,
      startsAt: v.startsAt,
      endsAt: v.endsAt,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putPromotion(ctx.tenantId, promotion);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-promotions",
      action: "retail.promotion.created",
      entityType: "promotion",
      entityId: id,
      details: { name: v.name, discountType: v.discountType, startsAt: v.startsAt, endsAt: v.endsAt },
    }));
    return ok(promotion);
}

//////////////////////////////////////////////////////////////////////
// activatePromotion — Activate a draft promotion. Enforces the active-promotion cap.
//////////////////////////////////////////////////////////////////////
export function activatePromotion(
  ctx: TenantContext,
  deps: Dependencies,
  input: ActivatePromotionInput
): Result<Promotion> {
  deps.permissions.require(ctx, asPermission("retail.promotions.activate"));
  const validated = validateActivatePromotionInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.promotionId);
    const existing = deps.store.getPromotion(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "promotion not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "draft") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only draft promotions can be activated");
    }
    // Cap check.
    const activeCount = deps.store.listPromotions(ctx.tenantId)
      .filter((p) => p.status === "active").length;
    if (activeCount >= deps.config.maxActivePromotionsPerTenant) {
      return err(ErrorCode.LIMIT_EXCEEDED, "active promotion limit reached");
    }
    const updated: Promotion = {
      ...existing,
      status: "active",
      updatedAt: new Date().toISOString(),
    };
    deps.store.putPromotion(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-promotions",
      action: "retail.promotion.activated",
      entityType: "promotion",
      entityId: id,
      details: { name: existing.name },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// listActivePromotions — List all currently active promotions (status=active and within date range).
//////////////////////////////////////////////////////////////////////
export function listActivePromotions(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly Promotion[]> {
  deps.permissions.require(ctx, asPermission("retail.promotions.read"));
    const now = new Date().toISOString();
    const all = deps.store.listPromotions(ctx.tenantId);
    const filtered = all.filter(
      (p) => p.status === "active" && p.startsAt <= now && p.endsAt > now
    );
    return ok(filtered);
}
