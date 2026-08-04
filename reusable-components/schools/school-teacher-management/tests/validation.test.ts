import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateTeacherInput,
  type CreateTeacherInput,
} from "../backend/validation";

describe("school-teacher-management / validateCreateTeacherInput", () => {
  it("accepts a valid input", () => {
    const input: CreateTeacherInput = {
    firstName: "value",
    lastName: "value",
    email: undefined,
    phone: undefined,
    subjectsJson: undefined,
    };
    const r = validateCreateTeacherInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when firstName is missing", () => {
    const input = {
      lastName: "value",
      email: undefined,
      phone: undefined,
      subjectsJson: undefined,
    } as any;
    const r = validateCreateTeacherInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when lastName is missing", () => {
    const input = {
      firstName: "value",
      email: undefined,
      phone: undefined,
      subjectsJson: undefined,
    } as any;
    const r = validateCreateTeacherInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
