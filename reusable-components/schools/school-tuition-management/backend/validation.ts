/**
 * Input validation helpers for the school-tuition-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateTuitionPlanInput(input: CreateTuitionPlanInput): Result<CreateTuitionPlanInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  if (input.totalAmountCents === undefined || input.totalAmountCents === null) {
    return err(ErrorCode.INVALID_INPUT, "totalAmountCents is required");
  }
  if (!Number.isInteger(input.totalAmountCents) || input.totalAmountCents <= 0) {
    return err(ErrorCode.INVALID_INPUT, "totalAmountCents must be a positive integer");
  }
  if (input.currency === undefined || input.currency === null || (typeof input.currency === "string" && input.currency.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "currency is required");
  }
  if (input.installmentsJson === undefined || input.installmentsJson === null || (typeof input.installmentsJson === "string" && input.installmentsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "installmentsJson is required");
  }
  return ok(input);
}

export function validateRecordTuitionPaymentInput(input: RecordTuitionPaymentInput): Result<RecordTuitionPaymentInput> {
  if (input.planId === undefined || input.planId === null || (typeof input.planId === "string" && input.planId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "planId is required");
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
  return ok(input);
}

export function validateComputeOutstandingBalanceInput(input: ComputeOutstandingBalanceInput): Result<ComputeOutstandingBalanceInput> {
  if (input.planId === undefined || input.planId === null || (typeof input.planId === "string" && input.planId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "planId is required");
  }
  return ok(input);
}

export interface CreateTuitionPlanInput {
  readonly studentId: string;
  readonly totalAmountCents: number;
  readonly currency: string;
  readonly installmentsJson: string;
}

export interface RecordTuitionPaymentInput {
  readonly planId: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly paymentReference?: string;
}

export interface ComputeOutstandingBalanceInput {
  readonly planId: string;
}
