/**
 * Input validation for organizations operations.
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export interface CreateOrganizationInput {
  readonly name: string;
  readonly slug: string;
  readonly industry: string;
  readonly creatorUserId: string;
}

export interface InviteMemberInput {
  readonly organizationId: string;
  readonly email: string;
  readonly role: string;
  readonly invitedByUserId: string;
}

export interface AcceptInvitationInput {
  readonly token: string;
  readonly userId: string;
}

export interface RevokeMembershipInput {
  readonly membershipId: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export function validateCreateOrganizationInput(input: CreateOrganizationInput): Result<CreateOrganizationInput> {
  if (!input.name || input.name.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.name.length > 200) {
    return err(ErrorCode.INVALID_INPUT, "name must be at most 200 characters");
  }
  if (!input.slug || !SLUG_RE.test(input.slug)) {
    return err(ErrorCode.INVALID_INPUT, "slug must be 3-50 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphen");
  }
  if (!input.industry || input.industry.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "industry is required");
  }
  if (!input.creatorUserId || input.creatorUserId.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "creatorUserId is required");
  }
  return ok(input);
}

export function validateInviteMemberInput(input: InviteMemberInput): Result<InviteMemberInput> {
  if (!input.organizationId || input.organizationId.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "organizationId is required");
  }
  if (!input.email || !EMAIL_RE.test(input.email)) {
    return err(ErrorCode.INVALID_INPUT, "email must be a valid email address");
  }
  if (!input.role || input.role.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "role is required");
  }
  if (!input.invitedByUserId || input.invitedByUserId.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "invitedByUserId is required");
  }
  return ok(input);
}

export function validateAcceptInvitationInput(input: AcceptInvitationInput): Result<AcceptInvitationInput> {
  if (!input.token || input.token.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "token is required");
  }
  if (!input.userId || input.userId.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "userId is required");
  }
  return ok(input);
}

export function validateRevokeMembershipInput(input: RevokeMembershipInput): Result<RevokeMembershipInput> {
  if (!input.membershipId || input.membershipId.trim().length === 0) {
    return err(ErrorCode.INVALID_INPUT, "membershipId is required");
  }
  return ok(input);
}
