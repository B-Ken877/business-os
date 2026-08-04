import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRecordAttendanceInput,
  type RecordAttendanceInput,
  validateComputeAttendanceRateInput,
  type ComputeAttendanceRateInput,
} from "../backend/validation";

describe("school-attendance / validateRecordAttendanceInput", () => {
  it("accepts a valid input", () => {
    const input: RecordAttendanceInput = {
    studentId: "ent_test",
    sessionDate: "2024-01-15",
    status: "present",
    notes: undefined,
    };
    const r = validateRecordAttendanceInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
      sessionDate: "2024-01-15",
      status: "present",
      notes: undefined,
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sessionDate is missing", () => {
    const input = {
      studentId: "ent_test",
      status: "present",
      notes: undefined,
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when status is missing", () => {
    const input = {
      studentId: "ent_test",
      sessionDate: "2024-01-15",
      notes: undefined,
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sessionDate violates iso-date", () => {
    const input = {
      studentId: "ent_test",
      sessionDate: "not-a-date",
      status: "present",
      notes: undefined,
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when status violates enum:present|absent|late|excused", () => {
    const input = {
      studentId: "ent_test",
      sessionDate: "2024-01-15",
      status: "__invalid__",
      notes: undefined,
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-attendance / validateComputeAttendanceRateInput", () => {
  it("accepts a valid input", () => {
    const input: ComputeAttendanceRateInput = {
    studentId: "ent_test",
    fromDate: "2024-01-15",
    toDate: "2024-01-15",
    };
    const r = validateComputeAttendanceRateInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
      fromDate: "2024-01-15",
      toDate: "2024-01-15",
    } as any;
    const r = validateComputeAttendanceRateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when fromDate is missing", () => {
    const input = {
      studentId: "ent_test",
      toDate: "2024-01-15",
    } as any;
    const r = validateComputeAttendanceRateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when toDate is missing", () => {
    const input = {
      studentId: "ent_test",
      fromDate: "2024-01-15",
    } as any;
    const r = validateComputeAttendanceRateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when fromDate violates iso-date", () => {
    const input = {
      studentId: "ent_test",
      fromDate: "not-a-date",
      toDate: "2024-01-15",
    } as any;
    const r = validateComputeAttendanceRateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when toDate violates iso-date", () => {
    const input = {
      studentId: "ent_test",
      fromDate: "2024-01-15",
      toDate: "not-a-date",
    } as any;
    const r = validateComputeAttendanceRateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
