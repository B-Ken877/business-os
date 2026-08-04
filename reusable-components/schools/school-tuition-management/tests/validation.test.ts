import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateTuitionPlanInput,
  type CreateTuitionPlanInput,
  validateRecordTuitionPaymentInput,
  type RecordTuitionPaymentInput,
  validateComputeOutstandingBalanceInput,
  type ComputeOutstandingBalanceInput,
} from "../backend/validation";

describe("school-tuition-management / validateCreateTuitionPlanInput", () => {
  it("accepts a valid input", () => {
    const input: CreateTuitionPlanInput = {
    studentId: "ent_test",
    totalAmountCents: 1,
    currency: "value",
    installmentsJson: "value",
    };
    const r = validateCreateTuitionPlanInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
      totalAmountCents: 1,
      currency: "value",
      installmentsJson: "value",
    } as any;
    const r = validateCreateTuitionPlanInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when totalAmountCents is missing", () => {
    const input = {
      studentId: "ent_test",
      currency: "value",
      installmentsJson: "value",
    } as any;
    const r = validateCreateTuitionPlanInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      studentId: "ent_test",
      totalAmountCents: 1,
      installmentsJson: "value",
    } as any;
    const r = validateCreateTuitionPlanInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when installmentsJson is missing", () => {
    const input = {
      studentId: "ent_test",
      totalAmountCents: 1,
      currency: "value",
    } as any;
    const r = validateCreateTuitionPlanInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when totalAmountCents violates positive-integer", () => {
    const input = {
      studentId: "ent_test",
      totalAmountCents: -1,
      currency: "value",
      installmentsJson: "value",
    } as any;
    const r = validateCreateTuitionPlanInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-tuition-management / validateRecordTuitionPaymentInput", () => {
  it("accepts a valid input", () => {
    const input: RecordTuitionPaymentInput = {
    planId: "ent_test",
    amountCents: 1,
    currency: "value",
    paymentReference: undefined,
    };
    const r = validateRecordTuitionPaymentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when planId is missing", () => {
    const input = {
      amountCents: 1,
      currency: "value",
      paymentReference: undefined,
    } as any;
    const r = validateRecordTuitionPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when amountCents is missing", () => {
    const input = {
      planId: "ent_test",
      currency: "value",
      paymentReference: undefined,
    } as any;
    const r = validateRecordTuitionPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      planId: "ent_test",
      amountCents: 1,
      paymentReference: undefined,
    } as any;
    const r = validateRecordTuitionPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when amountCents violates positive-integer", () => {
    const input = {
      planId: "ent_test",
      amountCents: -1,
      currency: "value",
      paymentReference: undefined,
    } as any;
    const r = validateRecordTuitionPaymentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-tuition-management / validateComputeOutstandingBalanceInput", () => {
  it("accepts a valid input", () => {
    const input: ComputeOutstandingBalanceInput = {
    planId: "ent_test",
    };
    const r = validateComputeOutstandingBalanceInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when planId is missing", () => {
    const input = {
    } as any;
    const r = validateComputeOutstandingBalanceInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
