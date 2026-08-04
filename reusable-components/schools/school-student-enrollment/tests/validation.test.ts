import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateEnrollStudentInput,
  type EnrollStudentInput,
  validateUpdateEnrollmentStatusInput,
  type UpdateEnrollmentStatusInput,
} from "../backend/validation";

describe("school-student-enrollment / validateEnrollStudentInput", () => {
  it("accepts a valid input", () => {
    const input: EnrollStudentInput = {
    firstName: "value",
    lastName: "value",
    dateOfBirth: "2024-01-15",
    guardianName: "value",
    guardianPhone: undefined,
    };
    const r = validateEnrollStudentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when firstName is missing", () => {
    const input = {
      lastName: "value",
      dateOfBirth: "2024-01-15",
      guardianName: "value",
      guardianPhone: undefined,
    } as any;
    const r = validateEnrollStudentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when lastName is missing", () => {
    const input = {
      firstName: "value",
      dateOfBirth: "2024-01-15",
      guardianName: "value",
      guardianPhone: undefined,
    } as any;
    const r = validateEnrollStudentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dateOfBirth is missing", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      guardianName: "value",
      guardianPhone: undefined,
    } as any;
    const r = validateEnrollStudentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when guardianName is missing", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      dateOfBirth: "2024-01-15",
      guardianPhone: undefined,
    } as any;
    const r = validateEnrollStudentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dateOfBirth violates iso-date", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      dateOfBirth: "not-a-date",
      guardianName: "value",
      guardianPhone: undefined,
    } as any;
    const r = validateEnrollStudentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-student-enrollment / validateUpdateEnrollmentStatusInput", () => {
  it("accepts a valid input", () => {
    const input: UpdateEnrollmentStatusInput = {
    studentId: "ent_test",
    newStatus: "applicant",
    };
    const r = validateUpdateEnrollmentStatusInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
      newStatus: "applicant",
    } as any;
    const r = validateUpdateEnrollmentStatusInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when newStatus is missing", () => {
    const input = {
      studentId: "ent_test",
    } as any;
    const r = validateUpdateEnrollmentStatusInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when newStatus violates enum:applicant|enrolled|withdrawn|graduated", () => {
    const input = {
      studentId: "ent_test",
      newStatus: "__invalid__",
    } as any;
    const r = validateUpdateEnrollmentStatusInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
