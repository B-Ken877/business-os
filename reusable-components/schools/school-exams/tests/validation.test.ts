import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateExamInput,
  type CreateExamInput,
  validateMarkExamGradedInput,
  type MarkExamGradedInput,
} from "../backend/validation";

describe("school-exams / validateCreateExamInput", () => {
  it("accepts a valid input", () => {
    const input: CreateExamInput = {
    name: "value",
    period: "value",
    startsAt: "2024-01-15",
    endsAt: "2024-01-15",
    };
    const r = validateCreateExamInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      period: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreateExamInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when period is missing", () => {
    const input = {
      name: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreateExamInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startsAt is missing", () => {
    const input = {
      name: "value",
      period: "value",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreateExamInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endsAt is missing", () => {
    const input = {
      name: "value",
      period: "value",
      startsAt: "2024-01-15",
    } as any;
    const r = validateCreateExamInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startsAt violates iso-date", () => {
    const input = {
      name: "value",
      period: "value",
      startsAt: "not-a-date",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreateExamInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endsAt violates iso-date", () => {
    const input = {
      name: "value",
      period: "value",
      startsAt: "2024-01-15",
      endsAt: "not-a-date",
    } as any;
    const r = validateCreateExamInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-exams / validateMarkExamGradedInput", () => {
  it("accepts a valid input", () => {
    const input: MarkExamGradedInput = {
    examId: "ent_test",
    };
    const r = validateMarkExamGradedInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when examId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkExamGradedInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
