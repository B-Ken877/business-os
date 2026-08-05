/**
 * Domain types for the identity module.
 *
 * Identity covers users, credentials, and sessions. It is the front door
 * to the platform — see ai-instructions/security-rules.md §2.
 *
 * The canonical contract. If docs and types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

/**
 * A user of the platform. A user may belong to multiple tenants
 * (organizations) — the membership is tracked in `core/organizations/`.
 */
export interface User {
  readonly id: EntityId;
  /** Email is the primary login identifier. Unique platform-wide. */
  readonly email: string;
  /** Full name for display. */
  readonly fullName: string;
  /** Status of the account. */
  readonly status: UserStatus;
  /** ISO-8601 timestamp of the last successful login, or null. */
  readonly lastLoginAt: string | null;
  /** ISO-8601 timestamp the user was created. */
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type UserStatus = "active" | "suspended" | "deleted";

/**
 * A credential record — the hashed password and parameters needed to
 * verify it. Stored separately from the User so that credential rotations
 * and breaches don't require touching the user table.
 *
 * Passwords are NEVER stored in plaintext. See security-rules.md §2.
 */
export interface UserCredential {
  readonly id: EntityId;
  readonly userId: EntityId;
  /** The hash output, base64-encoded. */
  readonly passwordHash: string;
  /** The salt used, base64-encoded. */
  readonly salt: string;
  /** The hashing algorithm used. */
  readonly algorithm: "scrypt";
  /** Cost parameter N (CPU/memory cost). */
  readonly costN: number;
  /** Block size parameter r. */
  readonly blockSizeR: number;
  /** Parallelization parameter p. */
  readonly parallelizationP: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * A session represents an authenticated user with an active token.
 * Sessions are server-side revocable per security-rules.md §2.
 */
export interface Session {
  readonly id: EntityId;
  readonly userId: EntityId;
  /** The opaque session token, base64url-encoded. 128 bits of entropy. */
  readonly token: string;
  /** ISO-8601 timestamp the session was created. */
  readonly createdAt: string;
  /** ISO-8601 timestamp the session expires. */
  readonly expiresAt: string;
  /** ISO-8601 timestamp of last activity, for idle timeout. */
  readonly lastSeenAt: string;
  /** IP address of the client that created the session, for audit. */
  readonly createdByIp: string | null;
  /** User-agent string of the client that created the session, for audit. */
  readonly createdByUserAgent: string | null;
  readonly status: SessionStatus;
}

export type SessionStatus = "active" | "revoked" | "expired";

/**
 * Result of a password verification. Never reveals which field was wrong
 * to avoid user enumeration.
 */
export interface AuthenticatedSession {
  readonly session: Session;
  readonly user: User;
}
