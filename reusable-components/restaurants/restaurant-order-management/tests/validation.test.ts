import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateOrderInput,
  type CreateOrderInput,
  validateAdvanceOrderStatusInput,
  type AdvanceOrderStatusInput,
  validateCancelOrderInput,
  type CancelOrderInput,
} from "../backend/validation";

describe("restaurant-order-management / validateCreateOrderInput", () => {
  it("accepts a valid input", () => {
    const input: CreateOrderInput = {
    itemsJson: "value",
    fulfillmentType: "dine_in",
    tableId: undefined,
    deliveryAddress: undefined,
    specialInstructions: undefined,
    };
    const r = validateCreateOrderInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when itemsJson is missing", () => {
    const input = {
      fulfillmentType: "dine_in",
      tableId: undefined,
      deliveryAddress: undefined,
      specialInstructions: undefined,
    } as any;
    const r = validateCreateOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when fulfillmentType is missing", () => {
    const input = {
      itemsJson: "value",
      tableId: undefined,
      deliveryAddress: undefined,
      specialInstructions: undefined,
    } as any;
    const r = validateCreateOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when fulfillmentType violates enum:dine_in|takeout|delivery", () => {
    const input = {
      itemsJson: "value",
      fulfillmentType: "__invalid__",
      tableId: undefined,
      deliveryAddress: undefined,
      specialInstructions: undefined,
    } as any;
    const r = validateCreateOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-order-management / validateAdvanceOrderStatusInput", () => {
  it("accepts a valid input", () => {
    const input: AdvanceOrderStatusInput = {
    orderId: "ent_test",
    };
    const r = validateAdvanceOrderStatusInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when orderId is missing", () => {
    const input = {
    } as any;
    const r = validateAdvanceOrderStatusInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-order-management / validateCancelOrderInput", () => {
  it("accepts a valid input", () => {
    const input: CancelOrderInput = {
    orderId: "ent_test",
    };
    const r = validateCancelOrderInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when orderId is missing", () => {
    const input = {
    } as any;
    const r = validateCancelOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
