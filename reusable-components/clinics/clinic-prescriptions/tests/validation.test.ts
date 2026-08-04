import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreatePrescriptionInput,
  type CreatePrescriptionInput,
  validateRefillPrescriptionInput,
  type RefillPrescriptionInput,
} from "../backend/validation";

describe("clinic-prescriptions / validateCreatePrescriptionInput", () => {
  it("accepts a valid input", () => {
    const input: CreatePrescriptionInput = {
    patientId: "ent_test",
    doctorStaffId: "ent_test",
    medicationName: "value",
    dosage: "value",
    durationDays: 1,
    refillsRemaining: 0,
    medicalRecordId: undefined,
    };
    const r = validateCreatePrescriptionInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      doctorStaffId: "ent_test",
      medicationName: "value",
      dosage: "value",
      durationDays: 1,
      refillsRemaining: 0,
      medicalRecordId: undefined,
    } as any;
    const r = validateCreatePrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when doctorStaffId is missing", () => {
    const input = {
      patientId: "ent_test",
      medicationName: "value",
      dosage: "value",
      durationDays: 1,
      refillsRemaining: 0,
      medicalRecordId: undefined,
    } as any;
    const r = validateCreatePrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when medicationName is missing", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      dosage: "value",
      durationDays: 1,
      refillsRemaining: 0,
      medicalRecordId: undefined,
    } as any;
    const r = validateCreatePrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dosage is missing", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      medicationName: "value",
      durationDays: 1,
      refillsRemaining: 0,
      medicalRecordId: undefined,
    } as any;
    const r = validateCreatePrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when durationDays is missing", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      medicationName: "value",
      dosage: "value",
      refillsRemaining: 0,
      medicalRecordId: undefined,
    } as any;
    const r = validateCreatePrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when refillsRemaining is missing", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      medicationName: "value",
      dosage: "value",
      durationDays: 1,
      medicalRecordId: undefined,
    } as any;
    const r = validateCreatePrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when durationDays violates positive-integer", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      medicationName: "value",
      dosage: "value",
      durationDays: -1,
      refillsRemaining: 0,
      medicalRecordId: undefined,
    } as any;
    const r = validateCreatePrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when refillsRemaining violates non-negative-integer", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      medicationName: "value",
      dosage: "value",
      durationDays: 1,
      refillsRemaining: -1,
      medicalRecordId: undefined,
    } as any;
    const r = validateCreatePrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-prescriptions / validateRefillPrescriptionInput", () => {
  it("accepts a valid input", () => {
    const input: RefillPrescriptionInput = {
    prescriptionId: "ent_test",
    };
    const r = validateRefillPrescriptionInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when prescriptionId is missing", () => {
    const input = {
    } as any;
    const r = validateRefillPrescriptionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
