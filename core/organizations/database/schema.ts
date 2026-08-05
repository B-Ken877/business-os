import type { EntityId, TenantId } from "@business-os/shared";

export interface OrganizationRow {
  readonly id: TenantId;
  readonly name: string;
  readonly slug: string;
  readonly industry: string;
  readonly status: "active" | "suspended" | "deleted";
  readonly created_at: string;
  readonly updated_at: string;
}

export interface MembershipRow {
  readonly id: EntityId;
  readonly organization_id: TenantId;
  readonly user_id: EntityId;
  readonly role: string;
  readonly status: "active" | "invited" | "revoked";
  readonly created_at: string;
  readonly updated_at: string;
}

export interface InvitationRow {
  readonly id: EntityId;
  readonly organization_id: TenantId;
  readonly email: string;
  readonly role: string;
  readonly token: string;
  readonly status: "pending" | "accepted" | "revoked" | "expired";
  readonly expires_at: string;
  readonly invited_by_user_id: EntityId;
  readonly created_at: string;
  readonly updated_at: string;
}

export const recommendedIndexes = [
  { table: "OrganizationRow", columns: ["id"], unique: true },
  { table: "OrganizationRow", columns: ["slug"], unique: true },
  { table: "MembershipRow", columns: ["id"], unique: true },
  { table: "MembershipRow", columns: ["organization_id", "user_id"], unique: true },
  { table: "MembershipRow", columns: ["user_id"], unique: false },
  { table: "InvitationRow", columns: ["token"], unique: true },
  { table: "InvitationRow", columns: ["organization_id"], unique: false },
] as const;
