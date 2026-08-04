import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateEvaluateStockLevelInput,
  type EvaluateStockLevelInput,
} from "../backend/validation";

describe("retail-stock-alerts / validateEvaluateStockLevelInput", () => {
  it("accepts a valid input", () => {
    const input: EvaluateStockLevelInput = {
    productId: "ent_test",
    currentQuantity: 0,
    threshold: 0,
    };
    const r = validateEvaluateStockLevelInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when productId is missing", () => {
    const input = {
      currentQuantity: 0,
      threshold: 0,
    } as any;
    const r = validateEvaluateStockLevelInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currentQuantity is missing", () => {
    const input = {
      productId: "ent_test",
      threshold: 0,
    } as any;
    const r = validateEvaluateStockLevelInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when threshold is missing", () => {
    const input = {
      productId: "ent_test",
      currentQuantity: 0,
    } as any;
    const r = validateEvaluateStockLevelInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currentQuantity violates non-negative-integer", () => {
    const input = {
      productId: "ent_test",
      currentQuantity: -1,
      threshold: 0,
    } as any;
    const r = validateEvaluateStockLevelInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when threshold violates non-negative-integer", () => {
    const input = {
      productId: "ent_test",
      currentQuantity: 0,
      threshold: -1,
    } as any;
    const r = validateEvaluateStockLevelInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
