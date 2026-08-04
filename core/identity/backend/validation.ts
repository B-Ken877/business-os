/**
 * Input validation for identity operations.
 *
 * See ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export interface RegisterUserInput {
  readonly email: string;
  readonly fullName: string;
  readonly password: string;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly createdByIp?: string;
  readonly createdByUserAgent?: string;
}

export interface ChangePasswordInput {
  readonly userId: string;
  readonly currentPassword: string;
  readonly newPassword: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterUserInput(input: RegisterUserInput): Result<RegisterUserInput> {
  if (!input.email || !EMAIL_RE.test(input.email)) {
    return err(ErrorCode.INVALID_INPUT, "email must be a valid email address");
  }
  if (input.email.length > 254) {
    return err(ErrorCode.INVALID_INPUT, "email must be at most 254 characters");
  }
  if (!input.fullName || input.fullName.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "fullName is required");
  }
  if (input.fullName.length > 200) {
    return err(ErrorCode.INVALID_INPUT, "fullName must be at most 200 characters");
  }
  if (!input.password || input.password.length < 12) {
    return err(ErrorCode.INVALID_INPUT, "password must be at least 12 characters");
  }
  return ok(input);
}

export function validateLoginInput(input: LoginInput): Result<LoginInput> {
  if (!input.email || !EMAIL_RE.test(input.email)) {
    return err(ErrorCode.INVALID_INPUT, "email must be a valid email address");
  }
  if (!input.password) {
    return err(ErrorCode.INVALID_INPUT, "password is required");
  }
  return ok(input);
}

export function validateChangePasswordInput(input: ChangePasswordInput): Result<ChangePasswordInput> {
  if (!input.userId || input.userId.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "userId is required");
  }
  if (!input.currentPassword) {
    return err(ErrorCode.INVALID_INPUT, "currentPassword is required");
  }
  if (!input.newPassword || input.newPassword.length < 12) {
    return err(ErrorCode.INVALID_INPUT, "newPassword must be at least 12 characters");
  }
  if (input.currentPassword === input.newPassword) {
    return err(ErrorCode.BUSINESS_RULE_VIOLATION, "new password must differ from current password");
  }
  return ok(input);
}
