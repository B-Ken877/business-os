/**
 * Input validation helpers for the clinic-lab-orders component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateOrderLabTestInput(input: OrderLabTestInput): Result<OrderLabTestInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.doctorStaffId === undefined || input.doctorStaffId === null || (typeof input.doctorStaffId === "string" && input.doctorStaffId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "doctorStaffId is required");
  }
  if (input.testName === undefined || input.testName === null || (typeof input.testName === "string" && input.testName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "testName is required");
  }
  return ok(input);
}

export function validateRecordResultInput(input: RecordResultInput): Result<RecordResultInput> {
  if (input.labOrderId === undefined || input.labOrderId === null || (typeof input.labOrderId === "string" && input.labOrderId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "labOrderId is required");
  }
  if (input.resultDocumentId === undefined || input.resultDocumentId === null || (typeof input.resultDocumentId === "string" && input.resultDocumentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "resultDocumentId is required");
  }
  return ok(input);
}

export interface OrderLabTestInput {
  readonly patientId: string;
  readonly doctorStaffId: string;
  readonly testName: string;
}

export interface RecordResultInput {
  readonly labOrderId: string;
  readonly resultDocumentId: string;
}
