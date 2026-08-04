import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateCustomerInput,
  type CreateCustomerInput,
  validateSetPreferencesInput,
  type SetPreferencesInput,
} from "../backend/validation";

describe("service-customer-management / validateCreateCustomerInput", () => {
  it("accepts a valid input", () => {
    const input: CreateCustomerInput = {
    name: "value",
    phone: undefined,
    email: undefined,
    address: undefined,
    };
    const r = validateCreateCustomerInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      phone: undefined,
      email: undefined,
      address: undefined,
    } as any;
    const r = validateCreateCustomerInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("service-customer-management / validateSetPreferencesInput", () => {
  it("accepts a valid input", () => {
    const input: SetPreferencesInput = {
    customerId: "ent_test",
    preferencesJson: "value",
    };
    const r = validateSetPreferencesInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerId is missing", () => {
    const input = {
      preferencesJson: "value",
    } as any;
    const r = validateSetPreferencesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when preferencesJson is missing", () => {
    const input = {
      customerId: "ent_test",
    } as any;
    const r = validateSetPreferencesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
