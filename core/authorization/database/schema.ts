import type { EntityId, TenantId, UserId, Permission } from "@business-os/shared";

export interface RoleDefinitionRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly name: string;
  readonly description: string;
  readonly permissions: ReadonlyArray<Permission>; // stored as JSON array
  readonly is_system: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface RoleGrantRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly user_id: UserId;
  readonly role_name: string;
  readonly status: "active" | "revoked";
  readonly created_at: string;
  readonly updated_at: string;
}

export const recommendedIndexes = [
  { table: "RoleDefinitionRow", columns: ["tenant_id", "name"], unique: true },
  { table: "RoleGrantRow", columns: ["tenant_id", "user_id"], unique: false },
  { table: "RoleGrantRow", columns: ["tenant_id", "user_id", "role_name"], unique: true },
] as const;
