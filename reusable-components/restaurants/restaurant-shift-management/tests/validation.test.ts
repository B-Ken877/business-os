import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateShiftInput,
  type CreateShiftInput,
  validateAddHandoffNotesInput,
  type AddHandoffNotesInput,
} from "../backend/validation";

describe("restaurant-shift-management / validateCreateShiftInput", () => {
  it("accepts a valid input", () => {
    const input: CreateShiftInput = {
    staffUserId: "value",
    startsAt: "2024-01-15",
    endsAt: "2024-01-15",
    role: "value",
    };
    const r = validateCreateShiftInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when staffUserId is missing", () => {
    const input = {
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
      role: "value",
    } as any;
    const r = validateCreateShiftInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startsAt is missing", () => {
    const input = {
      staffUserId: "value",
      endsAt: "2024-01-15",
      role: "value",
    } as any;
    const r = validateCreateShiftInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endsAt is missing", () => {
    const input = {
      staffUserId: "value",
      startsAt: "2024-01-15",
      role: "value",
    } as any;
    const r = validateCreateShiftInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when role is missing", () => {
    const input = {
      staffUserId: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreateShiftInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startsAt violates iso-date", () => {
    const input = {
      staffUserId: "value",
      startsAt: "not-a-date",
      endsAt: "2024-01-15",
      role: "value",
    } as any;
    const r = validateCreateShiftInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endsAt violates iso-date", () => {
    const input = {
      staffUserId: "value",
      startsAt: "2024-01-15",
      endsAt: "not-a-date",
      role: "value",
    } as any;
    const r = validateCreateShiftInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-shift-management / validateAddHandoffNotesInput", () => {
  it("accepts a valid input", () => {
    const input: AddHandoffNotesInput = {
    shiftId: "ent_test",
    notes: "value",
    };
    const r = validateAddHandoffNotesInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when shiftId is missing", () => {
    const input = {
      notes: "value",
    } as any;
    const r = validateAddHandoffNotesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when notes is missing", () => {
    const input = {
      shiftId: "ent_test",
    } as any;
    const r = validateAddHandoffNotesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
