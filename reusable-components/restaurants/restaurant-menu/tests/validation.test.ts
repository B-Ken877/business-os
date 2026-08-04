import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateMenuItemInput,
  type CreateMenuItemInput,
  validateSetAvailabilityInput,
  type SetAvailabilityInput,
} from "../backend/validation";

describe("restaurant-menu / validateCreateMenuItemInput", () => {
  it("accepts a valid input", () => {
    const input: CreateMenuItemInput = {
    name: "value",
    categoryId: "ent_test",
    priceCents: 0,
    currency: "value",
    description: undefined,
    };
    const r = validateCreateMenuItemInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      categoryId: "ent_test",
      priceCents: 0,
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateMenuItemInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when categoryId is missing", () => {
    const input = {
      name: "value",
      priceCents: 0,
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateMenuItemInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when priceCents is missing", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateMenuItemInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      priceCents: 0,
      description: undefined,
    } as any;
    const r = validateCreateMenuItemInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when priceCents violates non-negative-integer", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      priceCents: -1,
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateMenuItemInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-menu / validateSetAvailabilityInput", () => {
  it("accepts a valid input", () => {
    const input: SetAvailabilityInput = {
    itemId: "ent_test",
    available: false,
    };
    const r = validateSetAvailabilityInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when itemId is missing", () => {
    const input = {
      available: false,
    } as any;
    const r = validateSetAvailabilityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when available is missing", () => {
    const input = {
      itemId: "ent_test",
    } as any;
    const r = validateSetAvailabilityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
