import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateComputeDailySummaryInput,
  type ComputeDailySummaryInput,
} from "../backend/validation";

describe("retail-sales-reports / validateComputeDailySummaryInput", () => {
  it("accepts a valid input", () => {
    const input: ComputeDailySummaryInput = {
    date: "2024-01-15",
    };
    const r = validateComputeDailySummaryInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when date is missing", () => {
    const input = {
    } as any;
    const r = validateComputeDailySummaryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when date violates iso-date", () => {
    const input = {
      date: "not-a-date",
    } as any;
    const r = validateComputeDailySummaryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
