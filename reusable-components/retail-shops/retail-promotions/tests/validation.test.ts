import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreatePromotionInput,
  type CreatePromotionInput,
  validateActivatePromotionInput,
  type ActivatePromotionInput,
} from "../backend/validation";

describe("retail-promotions / validateCreatePromotionInput", () => {
  it("accepts a valid input", () => {
    const input: CreatePromotionInput = {
    name: "value",
    discountType: "percentage",
    discountValue: 0,
    scopeJson: "value",
    startsAt: "2024-01-15",
    endsAt: "2024-01-15",
    };
    const r = validateCreatePromotionInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      discountType: "percentage",
      discountValue: 0,
      scopeJson: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountType is missing", () => {
    const input = {
      name: "value",
      discountValue: 0,
      scopeJson: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountValue is missing", () => {
    const input = {
      name: "value",
      discountType: "percentage",
      scopeJson: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scopeJson is missing", () => {
    const input = {
      name: "value",
      discountType: "percentage",
      discountValue: 0,
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startsAt is missing", () => {
    const input = {
      name: "value",
      discountType: "percentage",
      discountValue: 0,
      scopeJson: "value",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endsAt is missing", () => {
    const input = {
      name: "value",
      discountType: "percentage",
      discountValue: 0,
      scopeJson: "value",
      startsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountType violates enum:percentage|fixed|bundle", () => {
    const input = {
      name: "value",
      discountType: "__invalid__",
      discountValue: 0,
      scopeJson: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when discountValue violates non-negative-integer", () => {
    const input = {
      name: "value",
      discountType: "percentage",
      discountValue: -1,
      scopeJson: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startsAt violates iso-date", () => {
    const input = {
      name: "value",
      discountType: "percentage",
      discountValue: 0,
      scopeJson: "value",
      startsAt: "not-a-date",
      endsAt: "2024-01-15",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endsAt violates iso-date", () => {
    const input = {
      name: "value",
      discountType: "percentage",
      discountValue: 0,
      scopeJson: "value",
      startsAt: "2024-01-15",
      endsAt: "not-a-date",
    } as any;
    const r = validateCreatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-promotions / validateActivatePromotionInput", () => {
  it("accepts a valid input", () => {
    const input: ActivatePromotionInput = {
    promotionId: "ent_test",
    };
    const r = validateActivatePromotionInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when promotionId is missing", () => {
    const input = {
    } as any;
    const r = validateActivatePromotionInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
