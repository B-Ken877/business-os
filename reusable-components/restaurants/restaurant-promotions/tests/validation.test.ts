import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateCouponInput,
  type CreateCouponInput,
  validateRedeemCouponInput,
  type RedeemCouponInput,
} from "../backend/validation";

describe("restaurant-promotions / validateCreateCouponInput", () => {
  it("accepts a valid input", () => {
    const input: CreateCouponInput = {
    code: "value",
    discountType: "percentage",
    discountValue: 0,
    maxRedemptions: 0,
    };
    const r = validateCreateCouponInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when code is missing", () => {
    const input = {
      discountType: "percentage",
      discountValue: 0,
      maxRedemptions: 0,
    } as any;
    const r = validateCreateCouponInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountType is missing", () => {
    const input = {
      code: "value",
      discountValue: 0,
      maxRedemptions: 0,
    } as any;
    const r = validateCreateCouponInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountValue is missing", () => {
    const input = {
      code: "value",
      discountType: "percentage",
      maxRedemptions: 0,
    } as any;
    const r = validateCreateCouponInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when maxRedemptions is missing", () => {
    const input = {
      code: "value",
      discountType: "percentage",
      discountValue: 0,
    } as any;
    const r = validateCreateCouponInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountType violates enum:percentage|fixed", () => {
    const input = {
      code: "value",
      discountType: "__invalid__",
      discountValue: 0,
      maxRedemptions: 0,
    } as any;
    const r = validateCreateCouponInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountValue violates non-negative-integer", () => {
    const input = {
      code: "value",
      discountType: "percentage",
      discountValue: -1,
      maxRedemptions: 0,
    } as any;
    const r = validateCreateCouponInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when maxRedemptions violates non-negative-integer", () => {
    const input = {
      code: "value",
      discountType: "percentage",
      discountValue: 0,
      maxRedemptions: -1,
    } as any;
    const r = validateCreateCouponInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-promotions / validateRedeemCouponInput", () => {
  it("accepts a valid input", () => {
    const input: RedeemCouponInput = {
    code: "value",
    };
    const r = validateRedeemCouponInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when code is missing", () => {
    const input = {
    } as any;
    const r = validateRedeemCouponInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
