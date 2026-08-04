import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateSetWorkingHoursInput,
  type SetWorkingHoursInput,
  validateIsAvailableInput,
  type IsAvailableInput,
} from "../backend/validation";

describe("service-scheduling / validateSetWorkingHoursInput", () => {
  it("accepts a valid input", () => {
    const input: SetWorkingHoursInput = {
    staffUserId: "value",
    dayOfWeek: 1,
    startHour: 0,
    endHour: 1,
    };
    const r = validateSetWorkingHoursInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when staffUserId is missing", () => {
    const input = {
      dayOfWeek: 1,
      startHour: 0,
      endHour: 1,
    } as any;
    const r = validateSetWorkingHoursInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dayOfWeek is missing", () => {
    const input = {
      staffUserId: "value",
      startHour: 0,
      endHour: 1,
    } as any;
    const r = validateSetWorkingHoursInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startHour is missing", () => {
    const input = {
      staffUserId: "value",
      dayOfWeek: 1,
      endHour: 1,
    } as any;
    const r = validateSetWorkingHoursInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endHour is missing", () => {
    const input = {
      staffUserId: "value",
      dayOfWeek: 1,
      startHour: 0,
    } as any;
    const r = validateSetWorkingHoursInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dayOfWeek violates positive-integer", () => {
    const input = {
      staffUserId: "value",
      dayOfWeek: -1,
      startHour: 0,
      endHour: 1,
    } as any;
    const r = validateSetWorkingHoursInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startHour violates non-negative-integer", () => {
    const input = {
      staffUserId: "value",
      dayOfWeek: 1,
      startHour: -1,
      endHour: 1,
    } as any;
    const r = validateSetWorkingHoursInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endHour violates positive-integer", () => {
    const input = {
      staffUserId: "value",
      dayOfWeek: 1,
      startHour: 0,
      endHour: -1,
    } as any;
    const r = validateSetWorkingHoursInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("service-scheduling / validateIsAvailableInput", () => {
  it("accepts a valid input", () => {
    const input: IsAvailableInput = {
    staffUserId: "value",
    at: "2024-01-15",
    };
    const r = validateIsAvailableInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when staffUserId is missing", () => {
    const input = {
      at: "2024-01-15",
    } as any;
    const r = validateIsAvailableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when at is missing", () => {
    const input = {
      staffUserId: "value",
    } as any;
    const r = validateIsAvailableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when at violates iso-date", () => {
    const input = {
      staffUserId: "value",
      at: "not-a-date",
    } as any;
    const r = validateIsAvailableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
