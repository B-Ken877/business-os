import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateStaffInput,
  type CreateStaffInput,
} from "../backend/validation";

describe("clinic-staff-management / validateCreateStaffInput", () => {
  it("accepts a valid input", () => {
    const input: CreateStaffInput = {
    firstName: "value",
    lastName: "value",
    role: "doctor",
    specialty: undefined,
    phone: undefined,
    email: undefined,
    };
    const r = validateCreateStaffInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when firstName is missing", () => {
    const input = {
      lastName: "value",
      role: "doctor",
      specialty: undefined,
      phone: undefined,
      email: undefined,
    } as any;
    const r = validateCreateStaffInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when lastName is missing", () => {
    const input = {
      firstName: "value",
      role: "doctor",
      specialty: undefined,
      phone: undefined,
      email: undefined,
    } as any;
    const r = validateCreateStaffInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when role is missing", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      specialty: undefined,
      phone: undefined,
      email: undefined,
    } as any;
    const r = validateCreateStaffInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when role violates enum:doctor|nurse|assistant|receptionist", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      role: "__invalid__",
      specialty: undefined,
      phone: undefined,
      email: undefined,
    } as any;
    const r = validateCreateStaffInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
