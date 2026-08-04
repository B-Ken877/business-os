import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateGenerateBillInput,
  type GenerateBillInput,
  validateMarkPaidInput,
  type MarkPaidInput,
} from "../backend/validation";

describe("restaurant-billing / validateGenerateBillInput", () => {
  it("accepts a valid input", () => {
    const input: GenerateBillInput = {
    orderIdsJson: "value",
    tipCents: 0,
    };
    const r = validateGenerateBillInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when orderIdsJson is missing", () => {
    const input = {
      tipCents: 0,
    } as any;
    const r = validateGenerateBillInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when tipCents is missing", () => {
    const input = {
      orderIdsJson: "value",
    } as any;
    const r = validateGenerateBillInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when tipCents violates non-negative-integer", () => {
    const input = {
      orderIdsJson: "value",
      tipCents: -1,
    } as any;
    const r = validateGenerateBillInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-billing / validateMarkPaidInput", () => {
  it("accepts a valid input", () => {
    const input: MarkPaidInput = {
    billId: "ent_test",
    };
    const r = validateMarkPaidInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when billId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkPaidInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
