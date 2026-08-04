import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreatePatientInput,
  type CreatePatientInput,
  validateGetPatientInput,
  type GetPatientInput,
} from "../backend/validation";

describe("clinic-patient-management / validateCreatePatientInput", () => {
  it("accepts a valid input", () => {
    const input: CreatePatientInput = {
    firstName: "value",
    lastName: "value",
    dateOfBirth: "2024-01-15",
    medicalRecordNumber: "value",
    phone: undefined,
    email: undefined,
    address: undefined,
    };
    const r = validateCreatePatientInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when firstName is missing", () => {
    const input = {
      lastName: "value",
      dateOfBirth: "2024-01-15",
      medicalRecordNumber: "value",
      phone: undefined,
      email: undefined,
      address: undefined,
    } as any;
    const r = validateCreatePatientInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when lastName is missing", () => {
    const input = {
      firstName: "value",
      dateOfBirth: "2024-01-15",
      medicalRecordNumber: "value",
      phone: undefined,
      email: undefined,
      address: undefined,
    } as any;
    const r = validateCreatePatientInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dateOfBirth is missing", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      medicalRecordNumber: "value",
      phone: undefined,
      email: undefined,
      address: undefined,
    } as any;
    const r = validateCreatePatientInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when medicalRecordNumber is missing", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      dateOfBirth: "2024-01-15",
      phone: undefined,
      email: undefined,
      address: undefined,
    } as any;
    const r = validateCreatePatientInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when dateOfBirth violates iso-date", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      dateOfBirth: "not-a-date",
      medicalRecordNumber: "value",
      phone: undefined,
      email: undefined,
      address: undefined,
    } as any;
    const r = validateCreatePatientInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-patient-management / validateGetPatientInput", () => {
  it("accepts a valid input", () => {
    const input: GetPatientInput = {
    patientId: "ent_test",
    };
    const r = validateGetPatientInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
    } as any;
    const r = validateGetPatientInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
