/**
 * Input validation helpers for the church-donations component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRecordDonationInput(input: RecordDonationInput): Result<RecordDonationInput> {
  if (input.memberId === undefined || input.memberId === null || (typeof input.memberId === "string" && input.memberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "memberId is required");
  }
  if (input.amountCents === undefined || input.amountCents === null) {
    return err(ErrorCode.INVALID_INPUT, "amountCents is required");
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    return err(ErrorCode.INVALID_INPUT, "amountCents must be a positive integer");
  }
  if (input.currency === undefined || input.currency === null || (typeof input.currency === "string" && input.currency.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "currency is required");
  }
  if (input.fund === undefined || input.fund === null || (typeof input.fund === "string" && input.fund.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "fund is required");
  }
  if (input.method === undefined || input.method === null) {
    return err(ErrorCode.INVALID_INPUT, "method is required");
  }
  if (!["cash", "mobile_money", "bank_transfer", "check"].includes(input.method)) {
    return err(ErrorCode.INVALID_INPUT, `method must be one of: "cash", "mobile_money", "bank_transfer", "check"`);
  }
  return ok(input);
}

export function validateComputeMemberGivingTotalInput(input: ComputeMemberGivingTotalInput): Result<ComputeMemberGivingTotalInput> {
  if (input.memberId === undefined || input.memberId === null || (typeof input.memberId === "string" && input.memberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "memberId is required");
  }
  if (input.fromDate === undefined || input.fromDate === null) {
    return err(ErrorCode.INVALID_INPUT, "fromDate is required");
  }
  if (typeof input.fromDate !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.fromDate)) {
    return err(ErrorCode.INVALID_INPUT, "fromDate must be an ISO-8601 date");
  }
  if (input.toDate === undefined || input.toDate === null) {
    return err(ErrorCode.INVALID_INPUT, "toDate is required");
  }
  if (typeof input.toDate !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.toDate)) {
    return err(ErrorCode.INVALID_INPUT, "toDate must be an ISO-8601 date");
  }
  return ok(input);
}

export interface RecordDonationInput {
  readonly memberId: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly fund: string;
  readonly method: string;
  readonly paymentReference?: string;
}

export interface ComputeMemberGivingTotalInput {
  readonly memberId: string;
  readonly fromDate: string;
  readonly toDate: string;
}
