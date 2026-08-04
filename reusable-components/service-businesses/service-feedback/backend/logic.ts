/**
 * Business logic for the service-feedback component.
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
  Feedback,
} from "./types";

import {
  type SubmitFeedbackInput,
  validateSubmitFeedbackInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ServiceFeedbackStore {
  getFeedback(tenantId: string, id: EntityId): Feedback | undefined;
  putFeedback(tenantId: string, entity: Feedback): void;
  listFeedbacks(tenantId: string): readonly Feedback[];
  deleteFeedback(tenantId: string, id: EntityId): boolean;
}

export class InMemoryServiceFeedbackStore implements ServiceFeedbackStore {
  private readonly feedbacks = new Map<string, Map<string, Feedback>>();

  getFeedback(tenantId: string, id: EntityId): Feedback | undefined {
    return this.feedbacks.get(tenantId)?.get(id);
  }
  putFeedback(tenantId: string, entity: Feedback): void {
    let byId = this.feedbacks.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.feedbacks.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listFeedbacks(tenantId: string): readonly Feedback[] {
    const byId = this.feedbacks.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteFeedback(tenantId: string, id: EntityId): boolean {
    return this.feedbacks.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ServiceFeedbackStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly minRatingForGood: number;
}

//////////////////////////////////////////////////////////////////////
// submitFeedback — Submit feedback for a booking.
//////////////////////////////////////////////////////////////////////
export function submitFeedback(
  ctx: TenantContext,
  deps: Dependencies,
  input: SubmitFeedbackInput
): Result<Feedback> {
  deps.permissions.require(ctx, asPermission("service.feedback.create"));
  const validated = validateSubmitFeedbackInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.rating < 1 || v.rating > 5) {
      return err(ErrorCode.INVALID_INPUT, "rating must be between 1 and 5");
    }
    // One feedback per booking.
    const existing = deps.store.listFeedbacks(ctx.tenantId)
      .find((f) => f.bookingId === v.bookingId);
    if (existing) {
      return err(ErrorCode.CONFLICT, "feedback already exists for this booking");
    }
    const id = asEntityId("fb_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const feedback: Feedback = {
      id, tenantId: ctx.tenantId, customerId: v.customerId, bookingId: v.bookingId,
      rating: v.rating, comment: v.comment ?? null,
      status: v.rating < deps.config.minRatingForGood ? "needs_followup" : "acknowledged",
      createdAt: now, updatedAt: now,
    };
    deps.store.putFeedback(ctx.tenantId, feedback);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-feedback",
      action: "service.feedback.submitted", entityType: "feedback", entityId: id,
      details: { customerId: v.customerId, bookingId: v.bookingId, rating: v.rating },
    }));
    return ok(feedback);
}

//////////////////////////////////////////////////////////////////////
// listNeedsFollowUp — List all feedback that needs follow-up (low ratings).
//////////////////////////////////////////////////////////////////////
export function listNeedsFollowUp(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly Feedback[]> {
  deps.permissions.require(ctx, asPermission("service.feedback.read"));
    const all = deps.store.listFeedbacks(ctx.tenantId);
    return ok(all.filter((f) => f.status === "needs_followup"));
}
