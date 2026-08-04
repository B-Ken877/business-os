/**
 * Result type — discriminated union for explicit error handling.
 *
 * Operations in reusable components return a `Result` instead of throwing,
 * so that:
 *
 * - Failures are visible in the function signature, not hidden.
 * - Callers cannot accidentally forget to handle the error path.
 * - Tests can assert on the structured error rather than catching exceptions.
 *
 * The only allowed exceptions are:
 *   - `TenantIsolationError` and `PermissionDeniedError` from `_shared/`
 *     (these are security boundaries and should crash loudly).
 *   - Programmer errors (TypeError from null deref, etc.) — these are bugs.
 *
 * See: ai-instructions/component-standard.md §5 (Be testable)
 */

export type Result<T, E = ResultError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export interface ResultError {
  /** Stable machine-readable code, e.g. `INVALID_INPUT`, `NOT_FOUND`. */
  readonly code: string;
  /** Human-readable message, safe to surface to logs but not to end users. */
  readonly message: string;
  /** Optional structured details for debugging. */
  readonly details?: ReadonlyArray<readonly [string, unknown]>;
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E extends ResultError = ResultError>(
  error: E
): Result<never, E>;
export function err<E extends ResultError = ResultError>(
  code: string,
  message: string,
  details?: ReadonlyArray<readonly [string, unknown]>
): Result<never, E>;
export function err<E extends ResultError = ResultError>(
  codeOrError: string | E,
  message?: string,
  details?: ReadonlyArray<readonly [string, unknown]>
): Result<never, E> {
  if (typeof codeOrError === "string") {
    return {
      ok: false,
      error: {
        code: codeOrError,
        message: message ?? codeOrError,
        details,
      } as E,
    };
  }
  return { ok: false, error: codeOrError };
}

/**
 * Convenience: wrap a thunk that may throw into a Result. Used sparingly —
 * most code should construct errors explicitly via `err()`.
 */
export function tryAsResult<T>(thunk: () => T): Result<T, ResultError> {
  try {
    return ok(thunk());
  } catch (e) {
    if (e instanceof Error) {
      return err("THROWN", e.message);
    }
    return err("THROWN", String(e));
  }
}

/**
 * Type guard narrowing a Result to its success branch.
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

/**
 * Type guard narrowing a Result to its failure branch.
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}
