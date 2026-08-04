import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRecordGradeInput,
  type RecordGradeInput,
  validateComputeStudentAverageInput,
  type ComputeStudentAverageInput,
} from "../backend/validation";

describe("school-grading / validateRecordGradeInput", () => {
  it("accepts a valid input", () => {
    const input: RecordGradeInput = {
    studentId: "ent_test",
    assessmentId: "ent_test",
    scorePct: 0,
    notes: undefined,
    };
    const r = validateRecordGradeInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
      assessmentId: "ent_test",
      scorePct: 0,
      notes: undefined,
    } as any;
    const r = validateRecordGradeInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when assessmentId is missing", () => {
    const input = {
      studentId: "ent_test",
      scorePct: 0,
      notes: undefined,
    } as any;
    const r = validateRecordGradeInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scorePct is missing", () => {
    const input = {
      studentId: "ent_test",
      assessmentId: "ent_test",
      notes: undefined,
    } as any;
    const r = validateRecordGradeInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scorePct violates non-negative-integer", () => {
    const input = {
      studentId: "ent_test",
      assessmentId: "ent_test",
      scorePct: -1,
      notes: undefined,
    } as any;
    const r = validateRecordGradeInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-grading / validateComputeStudentAverageInput", () => {
  it("accepts a valid input", () => {
    const input: ComputeStudentAverageInput = {
    studentId: "ent_test",
    };
    const r = validateComputeStudentAverageInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
    } as any;
    const r = validateComputeStudentAverageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
