import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateProductInput,
  type CreateProductInput,
  validateUpdatePriceInput,
  type UpdatePriceInput,
  validateArchiveProductInput,
  type ArchiveProductInput,
} from "../backend/validation";

describe("retail-product-catalog / validateCreateProductInput", () => {
  it("accepts a valid input", () => {
    const input: CreateProductInput = {
    name: "value",
    sku: "value",
    categoryId: "ent_test",
    priceCents: 0,
    currency: "value",
    description: undefined,
    };
    const r = validateCreateProductInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      sku: "value",
      categoryId: "ent_test",
      priceCents: 0,
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateProductInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sku is missing", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      priceCents: 0,
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateProductInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when categoryId is missing", () => {
    const input = {
      name: "value",
      sku: "value",
      priceCents: 0,
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateProductInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when priceCents is missing", () => {
    const input = {
      name: "value",
      sku: "value",
      categoryId: "ent_test",
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateProductInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      name: "value",
      sku: "value",
      categoryId: "ent_test",
      priceCents: 0,
      description: undefined,
    } as any;
    const r = validateCreateProductInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when priceCents violates non-negative-integer", () => {
    const input = {
      name: "value",
      sku: "value",
      categoryId: "ent_test",
      priceCents: -1,
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateProductInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-product-catalog / validateUpdatePriceInput", () => {
  it("accepts a valid input", () => {
    const input: UpdatePriceInput = {
    productId: "ent_test",
    newPriceCents: 0,
    };
    const r = validateUpdatePriceInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when productId is missing", () => {
    const input = {
      newPriceCents: 0,
    } as any;
    const r = validateUpdatePriceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when newPriceCents is missing", () => {
    const input = {
      productId: "ent_test",
    } as any;
    const r = validateUpdatePriceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when newPriceCents violates non-negative-integer", () => {
    const input = {
      productId: "ent_test",
      newPriceCents: -1,
    } as any;
    const r = validateUpdatePriceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-product-catalog / validateArchiveProductInput", () => {
  it("accepts a valid input", () => {
    const input: ArchiveProductInput = {
    productId: "ent_test",
    };
    const r = validateArchiveProductInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when productId is missing", () => {
    const input = {
    } as any;
    const r = validateArchiveProductInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
