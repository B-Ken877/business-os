/**
 * Public barrel for the shared primitives. Components import from here using
 * the `@business-os/shared` alias configured in tsconfig.json and vitest.
 *
 * Example:
 *
 *   import {
 *     type TenantContext,
 *     type PermissionChecker,
 *     ok,
 *     err,
 *     ErrorCode,
 *   } from "@business-os/shared";
 */

export type {
  TenantId,
  UserId,
  TenantContext,
} from "./tenant";

export {
  asTenantId,
  asUserId,
  createTenantContext,
  assertSameTenant,
  isSameTenant,
  TenantIsolationError,
} from "./tenant";

export type {
  Permission,
  Role,
  PermissionChecker,
} from "./permissions";

export {
  asPermission,
  PermissionDeniedError,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
} from "./permissions";

export type {
  Result,
  ResultError,
} from "./result";

export {
  ok,
  err,
  tryAsResult,
  isOk,
  isErr,
} from "./result";

export type {
  AuditEntry,
  AuditSink,
} from "./audit";

export {
  createAuditEntry,
  InMemoryAuditSink,
} from "./audit";

export type { EntityId } from "./ids";
export {
  asEntityId,
  generateId,
} from "./ids";

export { ErrorCode } from "./errors";
export type { ErrorCode as ErrorCodeType } from "./errors";
