import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCheckoutInput,
  type CheckoutInput,
  validateGetSaleInput,
  type GetSaleInput,
} from "../backend/validation";

describe("retail-point-of-sale / validateCheckoutInput", () => {
  it("accepts a valid input", () => {
    const input: CheckoutInput = {
    itemsJson: "value",
    discountCents: 0,
    paymentMethod: "cash",
    paymentReference: undefined,
    };
    const r = validateCheckoutInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when itemsJson is missing", () => {
    const input = {
      discountCents: 0,
      paymentMethod: "cash",
      paymentReference: undefined,
    } as any;
    const r = validateCheckoutInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountCents is missing", () => {
    const input = {
      itemsJson: "value",
      paymentMethod: "cash",
      paymentReference: undefined,
    } as any;
    const r = validateCheckoutInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when paymentMethod is missing", () => {
    const input = {
      itemsJson: "value",
      discountCents: 0,
      paymentReference: undefined,
    } as any;
    const r = validateCheckoutInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountCents violates non-negative-integer", () => {
    const input = {
      itemsJson: "value",
      discountCents: -1,
      paymentMethod: "cash",
      paymentReference: undefined,
    } as any;
    const r = validateCheckoutInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when paymentMethod violates enum:cash|card|mobile_money|bank_transfer", () => {
    const input = {
      itemsJson: "value",
      discountCents: 0,
      paymentMethod: "__invalid__",
      paymentReference: undefined,
    } as any;
    const r = validateCheckoutInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-point-of-sale / validateGetSaleInput", () => {
  it("accepts a valid input", () => {
    const input: GetSaleInput = {
    saleId: "ent_test",
    };
    const r = validateGetSaleInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when saleId is missing", () => {
    const input = {
    } as any;
    const r = validateGetSaleInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
