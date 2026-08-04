import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateRecordInput,
  type CreateRecordInput,
  validateListRecordsForPatientInput,
  type ListRecordsForPatientInput,
} from "../backend/validation";

describe("clinic-medical-records / validateCreateRecordInput", () => {
  it("accepts a valid input", () => {
    const input: CreateRecordInput = {
    patientId: "ent_test",
    doctorStaffId: "ent_test",
    consultationNotes: "value",
    diagnosis: undefined,
    treatmentPlan: undefined,
    appointmentId: undefined,
    };
    const r = validateCreateRecordInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      doctorStaffId: "ent_test",
      consultationNotes: "value",
      diagnosis: undefined,
      treatmentPlan: undefined,
      appointmentId: undefined,
    } as any;
    const r = validateCreateRecordInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when doctorStaffId is missing", () => {
    const input = {
      patientId: "ent_test",
      consultationNotes: "value",
      diagnosis: undefined,
      treatmentPlan: undefined,
      appointmentId: undefined,
    } as any;
    const r = validateCreateRecordInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when consultationNotes is missing", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      diagnosis: undefined,
      treatmentPlan: undefined,
      appointmentId: undefined,
    } as any;
    const r = validateCreateRecordInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-medical-records / validateListRecordsForPatientInput", () => {
  it("accepts a valid input", () => {
    const input: ListRecordsForPatientInput = {
    patientId: "ent_test",
    };
    const r = validateListRecordsForPatientInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
    } as any;
    const r = validateListRecordsForPatientInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
