import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateAddIngredientStockInput,
  type AddIngredientStockInput,
  validateDepleteForMenuItemInput,
  type DepleteForMenuItemInput,
} from "../backend/validation";

describe("restaurant-ingredient-tracking / validateAddIngredientStockInput", () => {
  it("accepts a valid input", () => {
    const input: AddIngredientStockInput = {
    ingredientId: "ent_test",
    quantityAdded: 1,
    };
    const r = validateAddIngredientStockInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when ingredientId is missing", () => {
    const input = {
      quantityAdded: 1,
    } as any;
    const r = validateAddIngredientStockInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when quantityAdded is missing", () => {
    const input = {
      ingredientId: "ent_test",
    } as any;
    const r = validateAddIngredientStockInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when quantityAdded violates positive-integer", () => {
    const input = {
      ingredientId: "ent_test",
      quantityAdded: -1,
    } as any;
    const r = validateAddIngredientStockInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-ingredient-tracking / validateDepleteForMenuItemInput", () => {
  it("accepts a valid input", () => {
    const input: DepleteForMenuItemInput = {
    menuItemIngredientKey: "value",
    quantitySold: 1,
    };
    const r = validateDepleteForMenuItemInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when menuItemIngredientKey is missing", () => {
    const input = {
      quantitySold: 1,
    } as any;
    const r = validateDepleteForMenuItemInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when quantitySold is missing", () => {
    const input = {
      menuItemIngredientKey: "value",
    } as any;
    const r = validateDepleteForMenuItemInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when quantitySold violates positive-integer", () => {
    const input = {
      menuItemIngredientKey: "value",
      quantitySold: -1,
    } as any;
    const r = validateDepleteForMenuItemInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
