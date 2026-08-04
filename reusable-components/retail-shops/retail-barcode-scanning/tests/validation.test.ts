import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRegisterBarcodeInput,
  type RegisterBarcodeInput,
  validateLookupBarcodeInput,
  type LookupBarcodeInput,
} from "../backend/validation";

describe("retail-barcode-scanning / validateRegisterBarcodeInput", () => {
  it("accepts a valid input", () => {
    const input: RegisterBarcodeInput = {
    code: "value",
    format: "value",
    productId: "ent_test",
    };
    const r = validateRegisterBarcodeInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when code is missing", () => {
    const input = {
      format: "value",
      productId: "ent_test",
    } as any;
    const r = validateRegisterBarcodeInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when format is missing", () => {
    const input = {
      code: "value",
      productId: "ent_test",
    } as any;
    const r = validateRegisterBarcodeInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when productId is missing", () => {
    const input = {
      code: "value",
      format: "value",
    } as any;
    const r = validateRegisterBarcodeInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-barcode-scanning / validateLookupBarcodeInput", () => {
  it("accepts a valid input", () => {
    const input: LookupBarcodeInput = {
    code: "value",
    };
    const r = validateLookupBarcodeInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when code is missing", () => {
    const input = {
    } as any;
    const r = validateLookupBarcodeInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
