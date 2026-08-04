/**
 * Input validation helpers for the church-groups component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateGroupInput(input: CreateGroupInput): Result<CreateGroupInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.leaderMemberId === undefined || input.leaderMemberId === null || (typeof input.leaderMemberId === "string" && input.leaderMemberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "leaderMemberId is required");
  }
  if (input.maxMembers === undefined || input.maxMembers === null) {
    return err(ErrorCode.INVALID_INPUT, "maxMembers is required");
  }
  if (!Number.isInteger(input.maxMembers) || input.maxMembers < 0) {
    return err(ErrorCode.INVALID_INPUT, "maxMembers must be a non-negative integer");
  }
  return ok(input);
}

export function validateJoinGroupInput(input: JoinGroupInput): Result<JoinGroupInput> {
  if (input.groupId === undefined || input.groupId === null || (typeof input.groupId === "string" && input.groupId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "groupId is required");
  }
  if (input.memberId === undefined || input.memberId === null || (typeof input.memberId === "string" && input.memberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "memberId is required");
  }
  return ok(input);
}

export interface CreateGroupInput {
  readonly name: string;
  readonly leaderMemberId: string;
  readonly maxMembers: number;
}

export interface JoinGroupInput {
  readonly groupId: string;
  readonly memberId: string;
}
