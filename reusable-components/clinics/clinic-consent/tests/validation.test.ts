import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateGrantConsentInput,
  type GrantConsentInput,
  validateRevokeConsentInput,
  type RevokeConsentInput,
  validateHasActiveConsentInput,
  type HasActiveConsentInput,
} from "../backend/validation";

describe("clinic-consent / validateGrantConsentInput", () => {
  it("accepts a valid input", () => {
    const input: GrantConsentInput = {
    patientId: "ent_test",
    purpose: "value",
    };
    const r = validateGrantConsentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      purpose: "value",
    } as any;
    const r = validateGrantConsentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when purpose is missing", () => {
    const input = {
      patientId: "ent_test",
    } as any;
    const r = validateGrantConsentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-consent / validateRevokeConsentInput", () => {
  it("accepts a valid input", () => {
    const input: RevokeConsentInput = {
    patientId: "ent_test",
    purpose: "value",
    reason: undefined,
    };
    const r = validateRevokeConsentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      purpose: "value",
      reason: undefined,
    } as any;
    const r = validateRevokeConsentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when purpose is missing", () => {
    const input = {
      patientId: "ent_test",
      reason: undefined,
    } as any;
    const r = validateRevokeConsentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-consent / validateHasActiveConsentInput", () => {
  it("accepts a valid input", () => {
    const input: HasActiveConsentInput = {
    patientId: "ent_test",
    purpose: "value",
    };
    const r = validateHasActiveConsentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      purpose: "value",
    } as any;
    const r = validateHasActiveConsentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when purpose is missing", () => {
    const input = {
      patientId: "ent_test",
    } as any;
    const r = validateHasActiveConsentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
