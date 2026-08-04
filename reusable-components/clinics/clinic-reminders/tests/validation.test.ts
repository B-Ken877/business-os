import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateScheduleReminderInput,
  type ScheduleReminderInput,
  validateCancelReminderInput,
  type CancelReminderInput,
} from "../backend/validation";

describe("clinic-reminders / validateScheduleReminderInput", () => {
  it("accepts a valid input", () => {
    const input: ScheduleReminderInput = {
    patientId: "ent_test",
    reminderType: "appointment",
    scheduledFor: "2024-01-15",
    payloadJson: "value",
    };
    const r = validateScheduleReminderInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      reminderType: "appointment",
      scheduledFor: "2024-01-15",
      payloadJson: "value",
    } as any;
    const r = validateScheduleReminderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when reminderType is missing", () => {
    const input = {
      patientId: "ent_test",
      scheduledFor: "2024-01-15",
      payloadJson: "value",
    } as any;
    const r = validateScheduleReminderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scheduledFor is missing", () => {
    const input = {
      patientId: "ent_test",
      reminderType: "appointment",
      payloadJson: "value",
    } as any;
    const r = validateScheduleReminderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when payloadJson is missing", () => {
    const input = {
      patientId: "ent_test",
      reminderType: "appointment",
      scheduledFor: "2024-01-15",
    } as any;
    const r = validateScheduleReminderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when reminderType violates enum:appointment|medication|follow_up", () => {
    const input = {
      patientId: "ent_test",
      reminderType: "__invalid__",
      scheduledFor: "2024-01-15",
      payloadJson: "value",
    } as any;
    const r = validateScheduleReminderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scheduledFor violates iso-date", () => {
    const input = {
      patientId: "ent_test",
      reminderType: "appointment",
      scheduledFor: "not-a-date",
      payloadJson: "value",
    } as any;
    const r = validateScheduleReminderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-reminders / validateCancelReminderInput", () => {
  it("accepts a valid input", () => {
    const input: CancelReminderInput = {
    reminderId: "ent_test",
    };
    const r = validateCancelReminderInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when reminderId is missing", () => {
    const input = {
    } as any;
    const r = validateCancelReminderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
