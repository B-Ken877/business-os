import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateQuoteInput,
  type CreateQuoteInput,
  validateApproveQuoteInput,
  type ApproveQuoteInput,
} from "../backend/validation";

describe("service-quotes / validateCreateQuoteInput", () => {
  it("accepts a valid input", () => {
    const input: CreateQuoteInput = {
    customerName: "value",
    customerPhone: undefined,
    itemsJson: "value",
    totalCents: 0,
    currency: "value",
    };
    const r = validateCreateQuoteInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerName is missing", () => {
    const input = {
      customerPhone: undefined,
      itemsJson: "value",
      totalCents: 0,
      currency: "value",
    } as any;
    const r = validateCreateQuoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when itemsJson is missing", () => {
    const input = {
      customerName: "value",
      customerPhone: undefined,
      totalCents: 0,
      currency: "value",
    } as any;
    const r = validateCreateQuoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when totalCents is missing", () => {
    const input = {
      customerName: "value",
      customerPhone: undefined,
      itemsJson: "value",
      currency: "value",
    } as any;
    const r = validateCreateQuoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      customerName: "value",
      customerPhone: undefined,
      itemsJson: "value",
      totalCents: 0,
    } as any;
    const r = validateCreateQuoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when totalCents violates non-negative-integer", () => {
    const input = {
      customerName: "value",
      customerPhone: undefined,
      itemsJson: "value",
      totalCents: -1,
      currency: "value",
    } as any;
    const r = validateCreateQuoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("service-quotes / validateApproveQuoteInput", () => {
  it("accepts a valid input", () => {
    const input: ApproveQuoteInput = {
    quoteId: "ent_test",
    };
    const r = validateApproveQuoteInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when quoteId is missing", () => {
    const input = {
    } as any;
    const r = validateApproveQuoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
