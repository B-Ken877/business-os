import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateOrderLabTestInput,
  type OrderLabTestInput,
  validateRecordResultInput,
  type RecordResultInput,
} from "../backend/validation";

describe("clinic-lab-orders / validateOrderLabTestInput", () => {
  it("accepts a valid input", () => {
    const input: OrderLabTestInput = {
    patientId: "ent_test",
    doctorStaffId: "ent_test",
    testName: "value",
    };
    const r = validateOrderLabTestInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      doctorStaffId: "ent_test",
      testName: "value",
    } as any;
    const r = validateOrderLabTestInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when doctorStaffId is missing", () => {
    const input = {
      patientId: "ent_test",
      testName: "value",
    } as any;
    const r = validateOrderLabTestInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when testName is missing", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
    } as any;
    const r = validateOrderLabTestInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-lab-orders / validateRecordResultInput", () => {
  it("accepts a valid input", () => {
    const input: RecordResultInput = {
    labOrderId: "ent_test",
    resultDocumentId: "ent_test",
    };
    const r = validateRecordResultInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when labOrderId is missing", () => {
    const input = {
      resultDocumentId: "ent_test",
    } as any;
    const r = validateRecordResultInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when resultDocumentId is missing", () => {
    const input = {
      labOrderId: "ent_test",
    } as any;
    const r = validateRecordResultInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
