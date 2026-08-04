/**
 * Well-known error codes used across all reusable components.
 *
 * Components should prefer these codes over inventing their own. If a
 * component genuinely needs a new code, it should be added here so that the
 * set of error codes is centrally discoverable.
 *
 * See: ai-instructions/component-standard.md §5 (Be testable)
 */

export const ErrorCode = {
  /** Input failed validation. */
  INVALID_INPUT: "INVALID_INPUT",
  /** Referenced entity does not exist. */
  NOT_FOUND: "NOT_FOUND",
  /** Operation conflicts with current state (e.g. duplicate id). */
  CONFLICT: "CONFLICT",
  /** Operation violates a business rule. */
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  /** Operation cannot proceed because dependent state is invalid. */
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
  /** Caller is not authorised to perform the operation. */
  PERMISSION_DENIED: "PERMISSION_DENIED",
  /** Caller attempted to access data belonging to another tenant. */
  TENANT_ISOLATION_VIOLATION: "TENANT_ISOLATION_VIOLATION",
  /** Operation would exceed a configured limit. */
  LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
  /** Operation is not supported in the current configuration. */
  NOT_SUPPORTED: "NOT_SUPPORTED",
  /** A required dependency returned an error. */
  DEPENDENCY_ERROR: "DEPENDENCY_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
