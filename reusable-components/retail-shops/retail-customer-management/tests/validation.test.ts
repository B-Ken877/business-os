import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateCustomerInput,
  type CreateCustomerInput,
  validateUpdateStatusInput,
  type UpdateStatusInput,
  validateAddLoyaltyNoteInput,
  type AddLoyaltyNoteInput,
} from "../backend/validation";

describe("retail-customer-management / validateCreateCustomerInput", () => {
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

describe("retail-customer-management / validateUpdateStatusInput", () => {
  it("accepts a valid input", () => {
    const input: UpdateStatusInput = {
    customerId: "ent_test",
    newStatus: "active",
    };
    const r = validateUpdateStatusInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerId is missing", () => {
    const input = {
      newStatus: "active",
    } as any;
    const r = validateUpdateStatusInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when newStatus is missing", () => {
    const input = {
      customerId: "ent_test",
    } as any;
    const r = validateUpdateStatusInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when newStatus violates enum:active|vip|blacklisted", () => {
    const input = {
      customerId: "ent_test",
      newStatus: "__invalid__",
    } as any;
    const r = validateUpdateStatusInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-customer-management / validateAddLoyaltyNoteInput", () => {
  it("accepts a valid input", () => {
    const input: AddLoyaltyNoteInput = {
    customerId: "ent_test",
    note: "value",
    };
    const r = validateAddLoyaltyNoteInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerId is missing", () => {
    const input = {
      note: "value",
    } as any;
    const r = validateAddLoyaltyNoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when note is missing", () => {
    const input = {
      customerId: "ent_test",
    } as any;
    const r = validateAddLoyaltyNoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
