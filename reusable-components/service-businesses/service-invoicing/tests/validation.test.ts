import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateGenerateInvoiceInput,
  type GenerateInvoiceInput,
  validateMarkPaidInput,
  type MarkPaidInput,
} from "../backend/validation";

describe("service-invoicing / validateGenerateInvoiceInput", () => {
  it("accepts a valid input", () => {
    const input: GenerateInvoiceInput = {
    customerId: "ent_test",
    subtotalCents: 0,
    currency: "value",
    bookingId: undefined,
    jobId: undefined,
    };
    const r = validateGenerateInvoiceInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerId is missing", () => {
    const input = {
      subtotalCents: 0,
      currency: "value",
      bookingId: undefined,
      jobId: undefined,
    } as any;
    const r = validateGenerateInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when subtotalCents is missing", () => {
    const input = {
      customerId: "ent_test",
      currency: "value",
      bookingId: undefined,
      jobId: undefined,
    } as any;
    const r = validateGenerateInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      customerId: "ent_test",
      subtotalCents: 0,
      bookingId: undefined,
      jobId: undefined,
    } as any;
    const r = validateGenerateInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when subtotalCents violates non-negative-integer", () => {
    const input = {
      customerId: "ent_test",
      subtotalCents: -1,
      currency: "value",
      bookingId: undefined,
      jobId: undefined,
    } as any;
    const r = validateGenerateInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("service-invoicing / validateMarkPaidInput", () => {
  it("accepts a valid input", () => {
    const input: MarkPaidInput = {
    invoiceId: "ent_test",
    };
    const r = validateMarkPaidInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when invoiceId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkPaidInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
