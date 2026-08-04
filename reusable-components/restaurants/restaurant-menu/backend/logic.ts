/**
 * Business logic for the restaurant-menu component.
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
  MenuItem,
} from "./types";

import {
  type CreateMenuItemInput,
  validateCreateMenuItemInput,
  type SetAvailabilityInput,
  validateSetAvailabilityInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantMenuStore {
  getMenuItem(tenantId: string, id: EntityId): MenuItem | undefined;
  putMenuItem(tenantId: string, entity: MenuItem): void;
  listMenuItems(tenantId: string): readonly MenuItem[];
  deleteMenuItem(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantMenuStore implements RestaurantMenuStore {
  private readonly menuItems = new Map<string, Map<string, MenuItem>>();

  getMenuItem(tenantId: string, id: EntityId): MenuItem | undefined {
    return this.menuItems.get(tenantId)?.get(id);
  }
  putMenuItem(tenantId: string, entity: MenuItem): void {
    let byId = this.menuItems.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.menuItems.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listMenuItems(tenantId: string): readonly MenuItem[] {
    const byId = this.menuItems.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteMenuItem(tenantId: string, id: EntityId): boolean {
    return this.menuItems.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantMenuStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultCurrency: string;
  readonly maxItemsPerTenant: number;
  readonly maxModifiersPerItem: number;
}

//////////////////////////////////////////////////////////////////////
// createMenuItem — Create a new menu item.
//////////////////////////////////////////////////////////////////////
export function createMenuItem(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateMenuItemInput
): Result<MenuItem> {
  deps.permissions.require(ctx, asPermission("restaurant.menu.items.manage"));
  const validated = validateCreateMenuItemInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("item_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const item: MenuItem = {
      id,
      tenantId: ctx.tenantId,
      name: v.name,
      description: v.description ?? "",
      categoryId: v.categoryId,
      priceCents: v.priceCents,
      currency: v.currency,
      modifiersJson: "[]",
      imageDocumentId: null,
      available: true,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putMenuItem(ctx.tenantId, item);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "restaurant-menu",
      action: "restaurant.menu.item_created",
      entityType: "menu_item",
      entityId: id,
      details: { name: v.name, priceCents: v.priceCents },
    }));
    return ok(item);
}

//////////////////////////////////////////////////////////////////////
// setAvailability — Mark a menu item as available or 86'd.
//////////////////////////////////////////////////////////////////////
export function setAvailability(
  ctx: TenantContext,
  deps: Dependencies,
  input: SetAvailabilityInput
): Result<MenuItem> {
  deps.permissions.require(ctx, asPermission("restaurant.menu.availability.manage"));
  const validated = validateSetAvailabilityInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.itemId);
    const existing = deps.store.getMenuItem(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "menu item not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.available === v.available) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "item already in this availability state");
    }
    const updated: MenuItem = {
      ...existing,
      available: v.available,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putMenuItem(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "restaurant-menu",
      action: "restaurant.menu.availability_changed",
      entityType: "menu_item",
      entityId: id,
      details: { name: existing.name, available: v.available },
    }));
    return ok(updated);
}
