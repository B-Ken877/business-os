/**
 * Input validation helpers for the forms-and-intake component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateDefineFormInput(input: DefineFormInput): Result<DefineFormInput> {
  if (input.slug === undefined || input.slug === null || (typeof input.slug === "string" && input.slug.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "slug is required");
  }
  if (input.title === undefined || input.title === null || (typeof input.title === "string" && input.title.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "title is required");
  }
  if (input.fieldsJson === undefined || input.fieldsJson === null || (typeof input.fieldsJson === "string" && input.fieldsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "fieldsJson is required");
  }
  return ok(input);
}

export function validatePublishFormInput(input: PublishFormInput): Result<PublishFormInput> {
  if (input.formId === undefined || input.formId === null || (typeof input.formId === "string" && input.formId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "formId is required");
  }
  return ok(input);
}

export function validateSubmitFormInput(input: SubmitFormInput): Result<SubmitFormInput> {
  if (input.formId === undefined || input.formId === null || (typeof input.formId === "string" && input.formId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "formId is required");
  }
  if (input.valuesJson === undefined || input.valuesJson === null || (typeof input.valuesJson === "string" && input.valuesJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "valuesJson is required");
  }
  return ok(input);
}

export interface DefineFormInput {
  readonly slug: string;
  readonly title: string;
  readonly fieldsJson: string;
}

export interface PublishFormInput {
  readonly formId: string;
}

export interface SubmitFormInput {
  readonly formId: string;
  readonly valuesJson: string;
}
