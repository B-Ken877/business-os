import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRecordPaymentInput,
  type RecordPaymentInput,
  validateRefundPaymentInput,
  type RefundPaymentInput,
  validateListPaymentsForInvoiceInput,
  type ListPaymentsForInvoiceInput,
} from "../backend/validation";

describe("payments-or-collections / validateRecordPaymentInput", () => {
  it("accepts a valid input", () => {
    const input: RecordPaymentInput = {
    amount: 1,
    currency: "value",
    method: "cash",
    providerReference: undefined,
    invoiceId: undefined,
    payerName: undefined,
    };
    const r = validateRecordPaymentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when amount is missing", () => {
    const input = {
      currency: "value",
      method: "cash",
      providerReference: undefined,
      invoiceId: undefined,
      payerName: undefined,
    } as any;
    const r = validateRecordPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      amount: 1,
      method: "cash",
      providerReference: undefined,
      invoiceId: undefined,
      payerName: undefined,
    } as any;
    const r = validateRecordPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when method is missing", () => {
    const input = {
      amount: 1,
      currency: "value",
      providerReference: undefined,
      invoiceId: undefined,
      payerName: undefined,
    } as any;
    const r = validateRecordPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when amount violates positive-integer", () => {
    const input = {
      amount: -1,
      currency: "value",
      method: "cash",
      providerReference: undefined,
      invoiceId: undefined,
      payerName: undefined,
    } as any;
    const r = validateRecordPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when method violates enum:cash|card|mobile_money|bank_transfer", () => {
    const input = {
      amount: 1,
      currency: "value",
      method: "__invalid__",
      providerReference: undefined,
      invoiceId: undefined,
      payerName: undefined,
    } as any;
    const r = validateRecordPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("payments-or-collections / validateRefundPaymentInput", () => {
  it("accepts a valid input", () => {
    const input: RefundPaymentInput = {
    paymentId: "ent_test",
    reason: "value",
    };
    const r = validateRefundPaymentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when paymentId is missing", () => {
    const input = {
      reason: "value",
    } as any;
    const r = validateRefundPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when reason is missing", () => {
    const input = {
      paymentId: "ent_test",
    } as any;
    const r = validateRefundPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("payments-or-collections / validateListPaymentsForInvoiceInput", () => {
  it("accepts a valid input", () => {
    const input: ListPaymentsForInvoiceInput = {
    invoiceId: "ent_test",
    };
    const r = validateListPaymentsForInvoiceInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when invoiceId is missing", () => {
    const input = {
    } as any;
    const r = validateListPaymentsForInvoiceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
