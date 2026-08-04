import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateAdjustStockInput,
  type AdjustStockInput,
  validateSetLowStockThresholdInput,
  type SetLowStockThresholdInput,
  validateListMovementsForProductInput,
  type ListMovementsForProductInput,
} from "../backend/validation";

describe("retail-inventory / validateAdjustStockInput", () => {
  it("accepts a valid input", () => {
    const input: AdjustStockInput = {
    productId: "ent_test",
    delta: 1,
    reason: "value",
    reference: undefined,
    };
    const r = validateAdjustStockInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when productId is missing", () => {
    const input = {
      delta: 1,
      reason: "value",
      reference: undefined,
    } as any;
    const r = validateAdjustStockInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when delta is missing", () => {
    const input = {
      productId: "ent_test",
      reason: "value",
      reference: undefined,
    } as any;
    const r = validateAdjustStockInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when reason is missing", () => {
    const input = {
      productId: "ent_test",
      delta: 1,
      reference: undefined,
    } as any;
    const r = validateAdjustStockInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-inventory / validateSetLowStockThresholdInput", () => {
  it("accepts a valid input", () => {
    const input: SetLowStockThresholdInput = {
    productId: "ent_test",
    threshold: 0,
    };
    const r = validateSetLowStockThresholdInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when productId is missing", () => {
    const input = {
      threshold: 0,
    } as any;
    const r = validateSetLowStockThresholdInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when threshold is missing", () => {
    const input = {
      productId: "ent_test",
    } as any;
    const r = validateSetLowStockThresholdInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when threshold violates non-negative-integer", () => {
    const input = {
      productId: "ent_test",
      threshold: -1,
    } as any;
    const r = validateSetLowStockThresholdInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-inventory / validateListMovementsForProductInput", () => {
  it("accepts a valid input", () => {
    const input: ListMovementsForProductInput = {
    productId: "ent_test",
    };
    const r = validateListMovementsForProductInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when productId is missing", () => {
    const input = {
    } as any;
    const r = validateListMovementsForProductInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
