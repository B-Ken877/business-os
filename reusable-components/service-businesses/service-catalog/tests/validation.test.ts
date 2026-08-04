import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateServiceInput,
  type CreateServiceInput,
} from "../backend/validation";

describe("service-catalog / validateCreateServiceInput", () => {
  it("accepts a valid input", () => {
    const input: CreateServiceInput = {
    name: "value",
    categoryId: "ent_test",
    priceCents: 0,
    currency: "value",
    durationMinutes: 1,
    description: undefined,
    };
    const r = validateCreateServiceInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      categoryId: "ent_test",
      priceCents: 0,
      currency: "value",
      durationMinutes: 1,
      description: undefined,
    } as any;
    const r = validateCreateServiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when categoryId is missing", () => {
    const input = {
      name: "value",
      priceCents: 0,
      currency: "value",
      durationMinutes: 1,
      description: undefined,
    } as any;
    const r = validateCreateServiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when priceCents is missing", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      currency: "value",
      durationMinutes: 1,
      description: undefined,
    } as any;
    const r = validateCreateServiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      priceCents: 0,
      durationMinutes: 1,
      description: undefined,
    } as any;
    const r = validateCreateServiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when durationMinutes is missing", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      priceCents: 0,
      currency: "value",
      description: undefined,
    } as any;
    const r = validateCreateServiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when priceCents violates non-negative-integer", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      priceCents: -1,
      currency: "value",
      durationMinutes: 1,
      description: undefined,
    } as any;
    const r = validateCreateServiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when durationMinutes violates positive-integer", () => {
    const input = {
      name: "value",
      categoryId: "ent_test",
      priceCents: 0,
      currency: "value",
      durationMinutes: -1,
      description: undefined,
    } as any;
    const r = validateCreateServiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
