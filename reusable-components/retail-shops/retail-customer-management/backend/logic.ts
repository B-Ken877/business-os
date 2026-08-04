/**
 * Business logic for the retail-customer-management component.
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
  Customer,
} from "./types";

import {
  type CreateCustomerInput,
  validateCreateCustomerInput,
  type UpdateStatusInput,
  validateUpdateStatusInput,
  type AddLoyaltyNoteInput,
  validateAddLoyaltyNoteInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailCustomerManagementStore {
  getCustomer(tenantId: string, id: EntityId): Customer | undefined;
  putCustomer(tenantId: string, entity: Customer): void;
  listCustomers(tenantId: string): readonly Customer[];
  deleteCustomer(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailCustomerManagementStore implements RetailCustomerManagementStore {
  private readonly customers = new Map<string, Map<string, Customer>>();

  getCustomer(tenantId: string, id: EntityId): Customer | undefined {
    return this.customers.get(tenantId)?.get(id);
  }
  putCustomer(tenantId: string, entity: Customer): void {
    let byId = this.customers.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.customers.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listCustomers(tenantId: string): readonly Customer[] {
    const byId = this.customers.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteCustomer(tenantId: string, id: EntityId): boolean {
    return this.customers.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailCustomerManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxCustomersPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// createCustomer — Create a new customer record.
//////////////////////////////////////////////////////////////////////
export function createCustomer(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateCustomerInput
): Result<Customer> {
  deps.permissions.require(ctx, asPermission("retail.customers.create"));
  const validated = validateCreateCustomerInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("cust_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const customer: Customer = {
      id,
      tenantId: ctx.tenantId,
      name: v.name,
      phone: v.phone ?? null,
      email: v.email ?? null,
      address: v.address ?? null,
      loyaltyNotes: "",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putCustomer(ctx.tenantId, customer);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-customer-management",
      action: "retail.customer.created",
      entityType: "customer",
      entityId: id,
      details: { name: v.name },
    }));
    return ok(customer);
}

//////////////////////////////////////////////////////////////////////
// updateStatus — Update a customer's status (active, vip, blacklisted).
//////////////////////////////////////////////////////////////////////
export function updateStatus(
  ctx: TenantContext,
  deps: Dependencies,
  input: UpdateStatusInput
): Result<Customer> {
  deps.permissions.require(ctx, asPermission("retail.customers.update"));
  const validated = validateUpdateStatusInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.customerId);
    const existing = deps.store.getCustomer(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "customer not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === v.newStatus) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "customer already has this status");
    }
    const updated: Customer = {
      ...existing,
      status: v.newStatus,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putCustomer(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-customer-management",
      action: "retail.customer.status_updated",
      entityType: "customer",
      entityId: id,
      details: { previousStatus: existing.status, newStatus: v.newStatus },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// addLoyaltyNote — Append a loyalty note to a customer's record. Existing notes are preserved.
//////////////////////////////////////////////////////////////////////
export function addLoyaltyNote(
  ctx: TenantContext,
  deps: Dependencies,
  input: AddLoyaltyNoteInput
): Result<Customer> {
  deps.permissions.require(ctx, asPermission("retail.customers.update"));
  const validated = validateAddLoyaltyNoteInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.customerId);
    const existing = deps.store.getCustomer(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "customer not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    const stamped = `[${new Date().toISOString()}] ${v.note}`;
    const updated: Customer = {
      ...existing,
      loyaltyNotes: existing.loyaltyNotes ? `${existing.loyaltyNotes}\n${stamped}` : stamped,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putCustomer(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-customer-management",
      action: "retail.customer.loyalty_note_added",
      entityType: "customer",
      entityId: id,
      details: { noteLength: v.note.length },
    }));
    return ok(updated);
}
