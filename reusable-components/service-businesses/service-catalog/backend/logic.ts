/**
 * Business logic for the service-catalog component.
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
  Service,
} from "./types";

import {
  type CreateServiceInput,
  validateCreateServiceInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ServiceCatalogStore {
  getService(tenantId: string, id: EntityId): Service | undefined;
  putService(tenantId: string, entity: Service): void;
  listServices(tenantId: string): readonly Service[];
  deleteService(tenantId: string, id: EntityId): boolean;
}

export class InMemoryServiceCatalogStore implements ServiceCatalogStore {
  private readonly services = new Map<string, Map<string, Service>>();

  getService(tenantId: string, id: EntityId): Service | undefined {
    return this.services.get(tenantId)?.get(id);
  }
  putService(tenantId: string, entity: Service): void {
    let byId = this.services.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.services.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listServices(tenantId: string): readonly Service[] {
    const byId = this.services.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteService(tenantId: string, id: EntityId): boolean {
    return this.services.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ServiceCatalogStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultCurrency: string;
  readonly maxServicesPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// createService — Create a new service.
//////////////////////////////////////////////////////////////////////
export function createService(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateServiceInput
): Result<Service> {
  deps.permissions.require(ctx, asPermission("service.catalog.manage"));
  const validated = validateCreateServiceInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("svc_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const service: Service = {
      id, tenantId: ctx.tenantId, name: v.name, description: v.description ?? "",
      categoryId: v.categoryId, priceCents: v.priceCents, currency: v.currency,
      durationMinutes: v.durationMinutes, status: "active",
      createdAt: now, updatedAt: now,
    };
    deps.store.putService(ctx.tenantId, service);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-catalog",
      action: "service.catalog.created", entityType: "service", entityId: id,
      details: { name: v.name, priceCents: v.priceCents, durationMinutes: v.durationMinutes },
    }));
    return ok(service);
}

//////////////////////////////////////////////////////////////////////
// listActiveServices — List all active services.
//////////////////////////////////////////////////////////////////////
export function listActiveServices(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly Service[]> {
  deps.permissions.require(ctx, asPermission("service.catalog.read"));
    const all = deps.store.listServices(ctx.tenantId);
    return ok(all.filter((s) => s.status === "active"));
}
