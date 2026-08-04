/**
 * Business logic for the clinic-reminders component.
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
  Reminder,
} from "./types";

import {
  type ScheduleReminderInput,
  validateScheduleReminderInput,
  type CancelReminderInput,
  validateCancelReminderInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicRemindersStore {
  getReminder(tenantId: string, id: EntityId): Reminder | undefined;
  putReminder(tenantId: string, entity: Reminder): void;
  listReminders(tenantId: string): readonly Reminder[];
  deleteReminder(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicRemindersStore implements ClinicRemindersStore {
  private readonly reminders = new Map<string, Map<string, Reminder>>();

  getReminder(tenantId: string, id: EntityId): Reminder | undefined {
    return this.reminders.get(tenantId)?.get(id);
  }
  putReminder(tenantId: string, entity: Reminder): void {
    let byId = this.reminders.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.reminders.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listReminders(tenantId: string): readonly Reminder[] {
    const byId = this.reminders.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteReminder(tenantId: string, id: EntityId): boolean {
    return this.reminders.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicRemindersStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultReminderLeadMinutes: number;
}

//////////////////////////////////////////////////////////////////////
// scheduleReminder — Schedule a reminder for a patient.
//////////////////////////////////////////////////////////////////////
export function scheduleReminder(
  ctx: TenantContext,
  deps: Dependencies,
  input: ScheduleReminderInput
): Result<Reminder> {
  deps.permissions.require(ctx, asPermission("clinic.reminders.schedule"));
  const validated = validateScheduleReminderInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    try { JSON.parse(v.payloadJson); } catch {
      return err(ErrorCode.INVALID_INPUT, "payloadJson is not valid JSON");
    }
    const id = asEntityId("rem_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const reminder: Reminder = {
      id, tenantId: ctx.tenantId, patientId: v.patientId, reminderType: v.reminderType,
      scheduledFor: v.scheduledFor, payloadJson: v.payloadJson,
      status: "scheduled", createdAt: now, updatedAt: now,
    };
    deps.store.putReminder(ctx.tenantId, reminder);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-reminders",
      action: "clinic.reminder.scheduled", entityType: "reminder", entityId: id,
      details: { patientId: v.patientId, reminderType: v.reminderType, scheduledFor: v.scheduledFor },
    }));
    return ok(reminder);
}

//////////////////////////////////////////////////////////////////////
// cancelReminder — Cancel a scheduled reminder.
//////////////////////////////////////////////////////////////////////
export function cancelReminder(
  ctx: TenantContext,
  deps: Dependencies,
  input: CancelReminderInput
): Result<Reminder> {
  deps.permissions.require(ctx, asPermission("clinic.reminders.cancel"));
  const validated = validateCancelReminderInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.reminderId);
    const existing = deps.store.getReminder(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "reminder not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "scheduled") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only scheduled reminders can be cancelled");
    }
    const updated: Reminder = {
      ...existing, status: "cancelled", updatedAt: new Date().toISOString(),
    };
    deps.store.putReminder(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-reminders",
      action: "clinic.reminder.cancelled", entityType: "reminder", entityId: id, details: {},
    }));
    return ok(updated);
}
