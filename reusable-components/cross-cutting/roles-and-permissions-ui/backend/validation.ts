/**
 * Input validation helpers for the roles-and-permissions-ui component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateDefineRoleInput(input: DefineRoleInput): Result<DefineRoleInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.permissionsJson === undefined || input.permissionsJson === null || (typeof input.permissionsJson === "string" && input.permissionsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "permissionsJson is required");
  }
  return ok(input);
}

export function validateListPermissionsForRoleInput(input: ListPermissionsForRoleInput): Result<ListPermissionsForRoleInput> {
  if (input.roleName === undefined || input.roleName === null || (typeof input.roleName === "string" && input.roleName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "roleName is required");
  }
  return ok(input);
}

export interface DefineRoleInput {
  readonly name: string;
  readonly description?: string;
  readonly permissionsJson: string;
}

export interface ListPermissionsForRoleInput {
  readonly roleName: string;
}
