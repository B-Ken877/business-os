import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateSupplierInput,
  type CreateSupplierInput,
  validateCreatePurchaseOrderInput,
  type CreatePurchaseOrderInput,
  validateMarkPurchaseOrderReceivedInput,
  type MarkPurchaseOrderReceivedInput,
} from "../backend/validation";

describe("retail-supplier-management / validateCreateSupplierInput", () => {
  it("accepts a valid input", () => {
    const input: CreateSupplierInput = {
    name: "value",
    contactName: undefined,
    phone: undefined,
    email: undefined,
    address: undefined,
    paymentTermsDays: 0,
    };
    const r = validateCreateSupplierInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      contactName: undefined,
      phone: undefined,
      email: undefined,
      address: undefined,
      paymentTermsDays: 0,
    } as any;
    const r = validateCreateSupplierInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when paymentTermsDays is missing", () => {
    const input = {
      name: "value",
      contactName: undefined,
      phone: undefined,
      email: undefined,
      address: undefined,
    } as any;
    const r = validateCreateSupplierInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when paymentTermsDays violates non-negative-integer", () => {
    const input = {
      name: "value",
      contactName: undefined,
      phone: undefined,
      email: undefined,
      address: undefined,
      paymentTermsDays: -1,
    } as any;
    const r = validateCreateSupplierInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-supplier-management / validateCreatePurchaseOrderInput", () => {
  it("accepts a valid input", () => {
    const input: CreatePurchaseOrderInput = {
    supplierId: "ent_test",
    itemsJson: "value",
    totalCents: 0,
    currency: "value",
    };
    const r = validateCreatePurchaseOrderInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when supplierId is missing", () => {
    const input = {
      itemsJson: "value",
      totalCents: 0,
      currency: "value",
    } as any;
    const r = validateCreatePurchaseOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when itemsJson is missing", () => {
    const input = {
      supplierId: "ent_test",
      totalCents: 0,
      currency: "value",
    } as any;
    const r = validateCreatePurchaseOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when totalCents is missing", () => {
    const input = {
      supplierId: "ent_test",
      itemsJson: "value",
      currency: "value",
    } as any;
    const r = validateCreatePurchaseOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      supplierId: "ent_test",
      itemsJson: "value",
      totalCents: 0,
    } as any;
    const r = validateCreatePurchaseOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when totalCents violates non-negative-integer", () => {
    const input = {
      supplierId: "ent_test",
      itemsJson: "value",
      totalCents: -1,
      currency: "value",
    } as any;
    const r = validateCreatePurchaseOrderInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("retail-supplier-management / validateMarkPurchaseOrderReceivedInput", () => {
  it("accepts a valid input", () => {
    const input: MarkPurchaseOrderReceivedInput = {
    purchaseOrderId: "ent_test",
    };
    const r = validateMarkPurchaseOrderReceivedInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when purchaseOrderId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkPurchaseOrderReceivedInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
