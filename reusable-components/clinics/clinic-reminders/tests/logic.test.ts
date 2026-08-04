import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryClinicRemindersStore,
  scheduleReminder,
  cancelReminder,
  defaultConfig,
  type Reminder,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicRemindersStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.reminders.schedule",
    "clinic.reminders.read",
    "clinic.reminders.cancel",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-reminders / scheduleReminder", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      scheduleReminder(ctx, denyDeps, { patientId: "ent_test", reminderType: "appointment", scheduledFor: "2024-01-15", payloadJson: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-reminders / cancelReminder", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      cancelReminder(ctx, denyDeps, { reminderId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-reminders / schedule + cancel rules", () => {
  it("schedules and cancels a reminder", () => {
    const { ctx, deps } = setup();
    const r = scheduleReminder(ctx, deps, {
      patientId: "ent_p1", reminderType: "appointment",
      scheduledFor: "2024-06-01T09:00:00Z",
      payloadJson: JSON.stringify({ appointmentId: "ent_a1" }),
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("scheduled");
    const c = cancelReminder(ctx, deps, { reminderId: r.value.id });
    expect(isOk(c)).toBe(true);
    if (!c.ok) return;
    expect(c.value.status).toBe("cancelled");
  });
  it("rejects malformed payloadJson", () => {
    const { ctx, deps } = setup();
    const r = scheduleReminder(ctx, deps, {
      patientId: "ent_p1", reminderType: "medication",
      scheduledFor: "2024-06-01T09:00:00Z", payloadJson: "not json",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
