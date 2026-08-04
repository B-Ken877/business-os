import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRecordDonationInput,
  type RecordDonationInput,
  validateComputeMemberGivingTotalInput,
  type ComputeMemberGivingTotalInput,
} from "../backend/validation";

describe("church-donations / validateRecordDonationInput", () => {
  it("accepts a valid input", () => {
    const input: RecordDonationInput = {
    memberId: "value",
    amountCents: 1,
    currency: "value",
    fund: "value",
    method: "cash",
    paymentReference: undefined,
    };
    const r = validateRecordDonationInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when memberId is missing", () => {
    const input = {
      amountCents: 1,
      currency: "value",
      fund: "value",
      method: "cash",
      paymentReference: undefined,
    } as any;
    const r = validateRecordDonationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when amountCents is missing", () => {
    const input = {
      memberId: "value",
      currency: "value",
      fund: "value",
      method: "cash",
      paymentReference: undefined,
    } as any;
    const r = validateRecordDonationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when currency is missing", () => {
    const input = {
      memberId: "value",
      amountCents: 1,
      fund: "value",
      method: "cash",
      paymentReference: undefined,
    } as any;
    const r = validateRecordDonationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when fund is missing", () => {
    const input = {
      memberId: "value",
      amountCents: 1,
      currency: "value",
      method: "cash",
      paymentReference: undefined,
    } as any;
    const r = validateRecordDonationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when method is missing", () => {
    const input = {
      memberId: "value",
      amountCents: 1,
      currency: "value",
      fund: "value",
      paymentReference: undefined,
    } as any;
    const r = validateRecordDonationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when amountCents violates positive-integer", () => {
    const input = {
      memberId: "value",
      amountCents: -1,
      currency: "value",
      fund: "value",
      method: "cash",
      paymentReference: undefined,
    } as any;
    const r = validateRecordDonationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when method violates enum:cash|mobile_money|bank_transfer|check", () => {
    const input = {
      memberId: "value",
      amountCents: 1,
      currency: "value",
      fund: "value",
      method: "__invalid__",
      paymentReference: undefined,
    } as any;
    const r = validateRecordDonationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("church-donations / validateComputeMemberGivingTotalInput", () => {
  it("accepts a valid input", () => {
    const input: ComputeMemberGivingTotalInput = {
    memberId: "value",
    fromDate: "2024-01-15",
    toDate: "2024-01-15",
    };
    const r = validateComputeMemberGivingTotalInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when memberId is missing", () => {
    const input = {
      fromDate: "2024-01-15",
      toDate: "2024-01-15",
    } as any;
    const r = validateComputeMemberGivingTotalInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when fromDate is missing", () => {
    const input = {
      memberId: "value",
      toDate: "2024-01-15",
    } as any;
    const r = validateComputeMemberGivingTotalInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when toDate is missing", () => {
    const input = {
      memberId: "value",
      fromDate: "2024-01-15",
    } as any;
    const r = validateComputeMemberGivingTotalInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when fromDate violates iso-date", () => {
    const input = {
      memberId: "value",
      fromDate: "not-a-date",
      toDate: "2024-01-15",
    } as any;
    const r = validateComputeMemberGivingTotalInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when toDate violates iso-date", () => {
    const input = {
      memberId: "value",
      fromDate: "2024-01-15",
      toDate: "not-a-date",
    } as any;
    const r = validateComputeMemberGivingTotalInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
