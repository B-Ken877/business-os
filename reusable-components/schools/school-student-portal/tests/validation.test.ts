import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateStartSessionInput,
  type StartSessionInput,
  validateEndSessionInput,
  type EndSessionInput,
} from "../backend/validation";

describe("school-student-portal / validateStartSessionInput", () => {
  it("accepts a valid input", () => {
    const input: StartSessionInput = {
    studentId: "ent_test",
    };
    const r = validateStartSessionInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
    } as any;
    const r = validateStartSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-student-portal / validateEndSessionInput", () => {
  it("accepts a valid input", () => {
    const input: EndSessionInput = {
    sessionId: "ent_test",
    };
    const r = validateEndSessionInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when sessionId is missing", () => {
    const input = {
    } as any;
    const r = validateEndSessionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
