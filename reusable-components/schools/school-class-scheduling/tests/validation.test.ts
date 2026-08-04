import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateScheduleSessionInput,
  type ScheduleSessionInput,
  validateListSessionsForTeacherInput,
  type ListSessionsForTeacherInput,
} from "../backend/validation";

describe("school-class-scheduling / validateScheduleSessionInput", () => {
  it("accepts a valid input", () => {
    const input: ScheduleSessionInput = {
    subject: "value",
    teacherUserId: "value",
    roomId: "ent_test",
    dayOfWeek: 1,
    startHour: 0,
    startMinute: 0,
    };
    const r = validateScheduleSessionInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when subject is missing", () => {
    const input = {
      teacherUserId: "value",
      roomId: "ent_test",
      dayOfWeek: 1,
      startHour: 0,
      startMinute: 0,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when teacherUserId is missing", () => {
    const input = {
      subject: "value",
      roomId: "ent_test",
      dayOfWeek: 1,
      startHour: 0,
      startMinute: 0,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when roomId is missing", () => {
    const input = {
      subject: "value",
      teacherUserId: "value",
      dayOfWeek: 1,
      startHour: 0,
      startMinute: 0,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dayOfWeek is missing", () => {
    const input = {
      subject: "value",
      teacherUserId: "value",
      roomId: "ent_test",
      startHour: 0,
      startMinute: 0,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startHour is missing", () => {
    const input = {
      subject: "value",
      teacherUserId: "value",
      roomId: "ent_test",
      dayOfWeek: 1,
      startMinute: 0,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startMinute is missing", () => {
    const input = {
      subject: "value",
      teacherUserId: "value",
      roomId: "ent_test",
      dayOfWeek: 1,
      startHour: 0,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dayOfWeek violates positive-integer", () => {
    const input = {
      subject: "value",
      teacherUserId: "value",
      roomId: "ent_test",
      dayOfWeek: -1,
      startHour: 0,
      startMinute: 0,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startHour violates non-negative-integer", () => {
    const input = {
      subject: "value",
      teacherUserId: "value",
      roomId: "ent_test",
      dayOfWeek: 1,
      startHour: -1,
      startMinute: 0,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startMinute violates non-negative-integer", () => {
    const input = {
      subject: "value",
      teacherUserId: "value",
      roomId: "ent_test",
      dayOfWeek: 1,
      startHour: 0,
      startMinute: -1,
    } as any;
    const r = validateScheduleSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-class-scheduling / validateListSessionsForTeacherInput", () => {
  it("accepts a valid input", () => {
    const input: ListSessionsForTeacherInput = {
    teacherUserId: "value",
    };
    const r = validateListSessionsForTeacherInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when teacherUserId is missing", () => {
    const input = {
    } as any;
    const r = validateListSessionsForTeacherInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
