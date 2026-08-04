import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateGenerateInvoiceInput,
  type GenerateInvoiceInput,
  validateMarkInvoicePaidInput,
  type MarkInvoicePaidInput,
} from "../backend/validation";

describe("clinic-billing / validateGenerateInvoiceInput", () => {
  it("accepts a valid input", () => {
    const input: GenerateInvoiceInput = {
    patientId: "ent_test",
    amountCents: 1,
    currency: "value",
    appointmentId: undefined,
    };
    const r = validateGenerateInvoiceInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      amountCents: 1,
      currency: "value",
      appointmentId: undefined,
    } as any;
    const r = validateGenerateInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when amountCents is missing", () => {
    const input = {
      patientId: "ent_test",
      currency: "value",
      appointmentId: undefined,
    } as any;
    const r = validateGenerateInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      patientId: "ent_test",
      amountCents: 1,
      appointmentId: undefined,
    } as any;
    const r = validateGenerateInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when amountCents violates positive-integer", () => {
    const input = {
      patientId: "ent_test",
      amountCents: -1,
      currency: "value",
      appointmentId: undefined,
    } as any;
    const r = validateGenerateInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-billing / validateMarkInvoicePaidInput", () => {
  it("accepts a valid input", () => {
    const input: MarkInvoicePaidInput = {
    invoiceId: "ent_test",
    };
    const r = validateMarkInvoicePaidInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when invoiceId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkInvoicePaidInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
