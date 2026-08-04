import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateIssueCertificateInput,
  type IssueCertificateInput,
  validateRevokeCertificateInput,
  type RevokeCertificateInput,
} from "../backend/validation";

describe("school-certificates / validateIssueCertificateInput", () => {
  it("accepts a valid input", () => {
    const input: IssueCertificateInput = {
    studentId: "ent_test",
    programName: "value",
    certificateNumber: "value",
    };
    const r = validateIssueCertificateInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
      programName: "value",
      certificateNumber: "value",
    } as any;
    const r = validateIssueCertificateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when programName is missing", () => {
    const input = {
      studentId: "ent_test",
      certificateNumber: "value",
    } as any;
    const r = validateIssueCertificateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when certificateNumber is missing", () => {
    const input = {
      studentId: "ent_test",
      programName: "value",
    } as any;
    const r = validateIssueCertificateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-certificates / validateRevokeCertificateInput", () => {
  it("accepts a valid input", () => {
    const input: RevokeCertificateInput = {
    certificateId: "ent_test",
    };
    const r = validateRevokeCertificateInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when certificateId is missing", () => {
    const input = {
    } as any;
    const r = validateRevokeCertificateInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
