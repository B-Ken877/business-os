import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRecordAttendanceInput,
  type RecordAttendanceInput,
  validateIsDecliningInput,
  type IsDecliningInput,
} from "../backend/validation";

describe("church-attendance / validateRecordAttendanceInput", () => {
  it("accepts a valid input", () => {
    const input: RecordAttendanceInput = {
    memberId: "value",
    serviceDate: "2024-01-15",
    attended: false,
    };
    const r = validateRecordAttendanceInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when memberId is missing", () => {
    const input = {
      serviceDate: "2024-01-15",
      attended: false,
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when serviceDate is missing", () => {
    const input = {
      memberId: "value",
      attended: false,
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when attended is missing", () => {
    const input = {
      memberId: "value",
      serviceDate: "2024-01-15",
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when serviceDate violates iso-date", () => {
    const input = {
      memberId: "value",
      serviceDate: "not-a-date",
      attended: false,
    } as any;
    const r = validateRecordAttendanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("church-attendance / validateIsDecliningInput", () => {
  it("accepts a valid input", () => {
    const input: IsDecliningInput = {
    memberId: "value",
    asOfDate: "2024-01-15",
    };
    const r = validateIsDecliningInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when memberId is missing", () => {
    const input = {
      asOfDate: "2024-01-15",
    } as any;
    const r = validateIsDecliningInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when asOfDate is missing", () => {
    const input = {
      memberId: "value",
    } as any;
    const r = validateIsDecliningInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when asOfDate violates iso-date", () => {
    const input = {
      memberId: "value",
      asOfDate: "not-a-date",
    } as any;
    const r = validateIsDecliningInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
