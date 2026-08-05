/**
 * Data model for core/identity.
 *
 * Declares the entities the identity module owns. A persistence adapter
 * (Postgres, SQLite) will translate these into actual schema migrations
 * when the platform's database layer is wired up.
 */

import type { EntityId } from "@business-os/shared";

export interface UserRow {
  readonly id: EntityId;
  readonly email: string;
  readonly full_name: string;
  readonly status: "active" | "suspended" | "deleted";
  readonly last_login_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface UserCredentialRow {
  readonly id: EntityId;
  readonly user_id: EntityId;
  readonly password_hash: string;
  readonly salt: string;
  readonly algorithm: "scrypt";
  readonly cost_n: number;
  readonly block_size_r: number;
  readonly parallelization_p: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SessionRow {
  readonly id: EntityId;
  readonly user_id: EntityId;
  /** The opaque session token. NEVER expose in URLs. */
  readonly token: string;
  readonly created_at: string;
  readonly expires_at: string;
  readonly last_seen_at: string;
  readonly created_by_ip: string | null;
  readonly created_by_user_agent: string | null;
  readonly status: "active" | "revoked" | "expired";
}

export const recommendedIndexes = [
  { table: "UserRow", columns: ["id"], unique: true },
  { table: "UserRow", columns: ["email"], unique: true },
  { table: "UserCredentialRow", columns: ["user_id"], unique: true },
  { table: "SessionRow", columns: ["token"], unique: true },
  { table: "SessionRow", columns: ["user_id"], unique: false },
] as const;
