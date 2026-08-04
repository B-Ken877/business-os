/**
 * Business logic for the church-donations component.
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
  Donation,
  Pledge,
} from "./types";

import {
  type RecordDonationInput,
  validateRecordDonationInput,
  type ComputeMemberGivingTotalInput,
  validateComputeMemberGivingTotalInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ChurchDonationsStore {
  getDonation(tenantId: string, id: EntityId): Donation | undefined;
  putDonation(tenantId: string, entity: Donation): void;
  listDonations(tenantId: string): readonly Donation[];
  deleteDonation(tenantId: string, id: EntityId): boolean;
  getPledge(tenantId: string, id: EntityId): Pledge | undefined;
  putPledge(tenantId: string, entity: Pledge): void;
  listPledges(tenantId: string): readonly Pledge[];
  deletePledge(tenantId: string, id: EntityId): boolean;
}

export class InMemoryChurchDonationsStore implements ChurchDonationsStore {
  private readonly donations = new Map<string, Map<string, Donation>>();
  private readonly pledges = new Map<string, Map<string, Pledge>>();

  getDonation(tenantId: string, id: EntityId): Donation | undefined {
    return this.donations.get(tenantId)?.get(id);
  }
  putDonation(tenantId: string, entity: Donation): void {
    let byId = this.donations.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.donations.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listDonations(tenantId: string): readonly Donation[] {
    const byId = this.donations.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteDonation(tenantId: string, id: EntityId): boolean {
    return this.donations.get(tenantId)?.delete(id) ?? false;
  }

  getPledge(tenantId: string, id: EntityId): Pledge | undefined {
    return this.pledges.get(tenantId)?.get(id);
  }
  putPledge(tenantId: string, entity: Pledge): void {
    let byId = this.pledges.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.pledges.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listPledges(tenantId: string): readonly Pledge[] {
    const byId = this.pledges.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deletePledge(tenantId: string, id: EntityId): boolean {
    return this.pledges.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ChurchDonationsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultCurrency: string;
  readonly requireFundDesignation: boolean;
}

//////////////////////////////////////////////////////////////////////
// recordDonation — Record a new donation.
//////////////////////////////////////////////////////////////////////
export function recordDonation(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordDonationInput
): Result<Donation> {
  deps.permissions.require(ctx, asPermission("church.donations.record"));
  const validated = validateRecordDonationInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (deps.config.requireFundDesignation && !v.fund) {
      return err(ErrorCode.INVALID_INPUT, "fund designation is required");
    }
    if (v.method !== "cash" && !v.paymentReference) {
      return err(ErrorCode.INVALID_INPUT, "paymentReference is required for non-cash donations");
    }
    const id = asEntityId("don_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const donation: Donation = {
      id, tenantId: ctx.tenantId, memberId: v.memberId, amountCents: v.amountCents,
      currency: v.currency, fund: v.fund, method: v.method,
      paymentReference: v.paymentReference ?? null, createdAt: now, updatedAt: now,
    };
    deps.store.putDonation(ctx.tenantId, donation);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-donations",
      action: "church.donation.recorded", entityType: "donation", entityId: id,
      details: { memberId: v.memberId, amountCents: v.amountCents, fund: v.fund, method: v.method },
    }));
    return ok(donation);
}

//////////////////////////////////////////////////////////////////////
// computeMemberGivingTotal — Compute a member's total giving over a date range. Requires the elevated 'read_member_history' permission because giving history is especially sensitive.
//////////////////////////////////////////////////////////////////////
export function computeMemberGivingTotal(
  ctx: TenantContext,
  deps: Dependencies,
  input: ComputeMemberGivingTotalInput
): Result<{ totalCents: number; currency: string; donationCount: number }> {
  deps.permissions.require(ctx, asPermission("church.donations.read_member_history"));
  const validated = validateComputeMemberGivingTotalInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.fromDate > v.toDate) {
      return err(ErrorCode.INVALID_INPUT, "fromDate must be <= toDate");
    }
    const all = deps.store.listDonations(ctx.tenantId);
    const memberDonations = all.filter(
      (d) => d.memberId === v.memberId && d.createdAt >= v.fromDate && d.createdAt <= v.toDate + "T23:59:59Z"
    );
    const totalCents = memberDonations.reduce((s, d) => s + d.amountCents, 0);
    // Audit the access itself — who looked at whose giving history.
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-donations",
      action: "church.donation.member_history_accessed", entityType: "donation",
      entityId: v.memberId,
      details: { memberId: v.memberId, fromDate: v.fromDate, toDate: v.toDate, donationCount: memberDonations.length },
    }));
    return ok({
      totalCents, currency: memberDonations[0]?.currency ?? "HTG",
      donationCount: memberDonations.length,
    });
}
