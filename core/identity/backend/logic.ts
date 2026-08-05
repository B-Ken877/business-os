/**
 * Business logic for the identity module.
 *
 * Every operation enforces three things, in this order:
 *   1. Input validation (returns Result.err).
 *   2. Business rules (returns Result.err).
 *   3. Audit (writes an AuditEntry to the injected AuditSink).
 *
 * Permission checks are NOT enforced here because identity operations are
 * bootstrapping — you cannot check a permission before the user exists.
 * The HTTP layer (a future core/http module) enforces that unauthenticated
 * users can only call registerUser and login.
 */

import {
  type TenantContext,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asEntityId,
  asUserId,
  createAuditEntry,
  ErrorCode,
} from "@business-os/shared";
import type { User, UserCredential, Session, AuthenticatedSession } from "./types";
import type { RegisterUserInput, LoginInput, ChangePasswordInput } from "./validation";
import {
  validateRegisterUserInput,
  validateLoginInput,
  validateChangePasswordInput,
} from "./validation";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  WeakPasswordError,
} from "./passwords";

// ---------------------------------------------------------------------------
// Persistence interface
// ---------------------------------------------------------------------------

export interface IdentityStore {
  // Users
  getUser(id: EntityId): User | undefined;
  getUserByEmail(email: string): User | undefined;
  putUser(user: User): void;
  listUsers(): readonly User[];

  // Credentials
  getCredential(userId: EntityId): UserCredential | undefined;
  putCredential(credential: UserCredential): void;

  // Sessions
  getSession(token: string): Session | undefined;
  getSessionById(id: EntityId): Session | undefined;
  putSession(session: Session): void;
  listSessionsForUser(userId: EntityId): readonly Session[];
}

// ---------------------------------------------------------------------------
// In-memory store (for tests + early development)
// ---------------------------------------------------------------------------

export class InMemoryIdentityStore implements IdentityStore {
  private readonly users = new Map<string, User>();
  private readonly usersByEmail = new Map<string, User>();
  private readonly credentials = new Map<string, UserCredential>();
  private readonly sessionsByToken = new Map<string, Session>();
  private readonly sessionsById = new Map<string, Session>();

  getUser(id: EntityId): User | undefined {
    return this.users.get(id);
  }
  getUserByEmail(email: string): User | undefined {
    return this.usersByEmail.get(email.toLowerCase());
  }
  putUser(user: User): void {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase(), user);
  }
  listUsers(): readonly User[] {
    return [...this.users.values()];
  }

  getCredential(userId: EntityId): UserCredential | undefined {
    return this.credentials.get(userId);
  }
  putCredential(credential: UserCredential): void {
    this.credentials.set(credential.userId, credential);
  }

  getSession(token: string): Session | undefined {
    return this.sessionsByToken.get(token);
  }
  getSessionById(id: EntityId): Session | undefined {
    return this.sessionsById.get(id);
  }
  putSession(session: Session): void {
    this.sessionsByToken.set(session.token, session);
    this.sessionsById.set(session.id, session);
  }
  listSessionsForUser(userId: EntityId): readonly Session[] {
    return [...this.sessionsByToken.values()].filter((s) => s.userId === userId);
  }
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

export interface IdentityConfig {
  /** Session lifetime in seconds. Default: 7 days. */
  readonly sessionLifetimeSeconds: number;
  /** Idle timeout in seconds. Default: 30 minutes. */
  readonly idleTimeoutSeconds: number;
}

export const defaultIdentityConfig: IdentityConfig = {
  sessionLifetimeSeconds: 7 * 24 * 3600,
  idleTimeoutSeconds: 30 * 60,
};

export interface Dependencies {
  readonly store: IdentityStore;
  readonly audit: AuditSink;
  readonly config: IdentityConfig;
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/**
 * Register a new user. The user is created with status 'active'.
 *
 * Email must be unique platform-wide. Passwords are hashed with scrypt
 * before storage — the plaintext is NEVER persisted.
 *
 * Note: this operation does NOT create a tenant or grant any roles.
 * Tenant membership is managed by core/organizations. The user exists in
 * isolation until they are invited to a tenant.
 */
export async function registerUser(
  deps: Dependencies,
  input: RegisterUserInput
): Promise<Result<{ user: User; session: Session }>> {
  const validated = validateRegisterUserInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;

  // Email uniqueness.
  const existing = deps.store.getUserByEmail(v.email);
  if (existing) {
    // Deliberately do NOT reveal that the email exists — return a generic
    // error to prevent enumeration. The HTTP layer should treat this the
    // same as a successful registration for timing purposes.
    return err(ErrorCode.CONFLICT, "registration failed");
  }

  let hashed;
  try {
    hashed = await hashPassword(v.password);
  } catch (e) {
    if (e instanceof WeakPasswordError) {
      return err(ErrorCode.INVALID_INPUT, e.message);
    }
    throw e;
  }

  const userId = asEntityId("usr_" + Math.random().toString(36).slice(2, 12));
  const now = new Date().toISOString();
  const user: User = {
    id: userId,
    email: v.email.toLowerCase(),
    fullName: v.fullName,
    status: "active",
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };
  deps.store.putUser(user);

  const credential: UserCredential = {
    id: asEntityId("cred_" + Math.random().toString(36).slice(2, 12)),
    userId,
    passwordHash: hashed.hash,
    salt: hashed.salt,
    algorithm: hashed.algorithm,
    costN: hashed.costN,
    blockSizeR: hashed.blockSizeR,
    parallelizationP: hashed.parallelizationP,
    createdAt: now,
    updatedAt: now,
  };
  deps.store.putCredential(credential);

  // Create the first session.
  const session = createSessionRecord(userId, deps.config, null, null);
  deps.store.putSession(session);

  deps.audit.record(
    createAuditEntry({
      tenantId: "_platform" as any, // identity is platform-wide, not tenant-scoped
      actorUserId: asUserId(userId),
      componentId: "core/identity",
      action: "identity.user.registered",
      entityType: "user",
      entityId: userId,
      details: { email: user.email, fullName: user.fullName },
    })
  );

  return ok({ user, session });
}

/**
 * Log in a user with email + password.
 *
 * Returns an authenticated session on success. On failure, returns a
 * generic INVALID_INPUT error — never reveals whether the email or the
 * password was wrong, to prevent enumeration.
 */
export async function loginUser(
  deps: Dependencies,
  input: LoginInput
): Promise<Result<AuthenticatedSession>> {
  const validated = validateLoginInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;

  const user = deps.store.getUserByEmail(v.email);
  if (!user) {
    // Constant-time-ish: still hash a dummy password to avoid timing oracle.
    await hashPassword("dummy-password-to-burn-time-12345");
    return err(ErrorCode.INVALID_INPUT, "invalid credentials");
  }
  if (user.status !== "active") {
    return err(ErrorCode.PERMISSION_DENIED, "account is not active");
  }

  const credential = deps.store.getCredential(user.id);
  if (!credential) {
    return err(ErrorCode.INVALID_INPUT, "invalid credentials");
  }

  const passwordOk = await verifyPassword(v.password, {
    hash: credential.passwordHash,
    salt: credential.salt,
    algorithm: credential.algorithm,
    costN: credential.costN,
    blockSizeR: credential.blockSizeR,
    parallelizationP: credential.parallelizationP,
  });
  if (!passwordOk) {
    return err(ErrorCode.INVALID_INPUT, "invalid credentials");
  }

  // Update last login.
  const updatedUser: User = {
    ...user,
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  deps.store.putUser(updatedUser);

  const session = createSessionRecord(user.id, deps.config, v.createdByIp ?? null, v.createdByUserAgent ?? null);
  deps.store.putSession(session);

  deps.audit.record(
    createAuditEntry({
      tenantId: "_platform" as any,
      actorUserId: asUserId(user.id),
      componentId: "core/identity",
      action: "identity.user.logged_in",
      entityType: "user",
      entityId: user.id,
      details: { email: user.email, sessionId: session.id },
    })
  );

  return ok({ session, user: updatedUser });
}

/**
 * Log out a session by revoking it. Idempotent — revoking an already-revoked
 * session is a no-op success.
 */
export function logoutSession(deps: Dependencies, token: string): Result<null> {
  const session = deps.store.getSession(token);
  if (!session) {
    // Idempotent: already logged out (or never existed). Don't leak existence.
    return ok(null);
  }
  if (session.status === "active") {
    const updated: Session = {
      ...session,
      status: "revoked",
    };
    deps.store.putSession(updated);
    deps.audit.record(
      createAuditEntry({
        tenantId: "_platform" as any,
        actorUserId: asUserId(session.userId),
        componentId: "core/identity",
        action: "identity.session.revoked",
        entityType: "session",
        entityId: session.id,
        details: {},
      })
    );
  }
  return ok(null);
}

/**
 * Verify a session token. Returns the session + user if the token is valid
 * and active. Returns NOT_FOUND if the token is invalid, expired, or revoked.
 *
 * Also updates lastSeenAt (idle timeout tracking).
 */
export function verifySession(deps: Dependencies, token: string): Result<AuthenticatedSession> {
  const session = deps.store.getSession(token);
  if (!session || session.status !== "active") {
    return err(ErrorCode.NOT_FOUND, "session not found");
  }
  const now = Date.now();
  if (new Date(session.expiresAt).getTime() < now) {
    // Mark expired.
    const updated: Session = { ...session, status: "expired" };
    deps.store.putSession(updated);
    return err(ErrorCode.NOT_FOUND, "session expired");
  }
  // Idle timeout.
  const idleMs = (now - new Date(session.lastSeenAt).getTime());
  if (idleMs > deps.config.idleTimeoutSeconds * 1000) {
    const updated: Session = { ...session, status: "expired" };
    deps.store.putSession(updated);
    return err(ErrorCode.NOT_FOUND, "session expired due to inactivity");
  }

  const user = deps.store.getUser(session.userId);
  if (!user || user.status !== "active") {
    return err(ErrorCode.PERMISSION_DENIED, "user is not active");
  }

  // Update lastSeenAt.
  const touched: Session = {
    ...session,
    lastSeenAt: new Date().toISOString(),
  };
  deps.store.putSession(touched);

  return ok({ session: touched, user });
}

/**
 * Change the current user's password. Requires the current password.
 * Does NOT invalidate existing sessions — the user can do that separately
 * via revokeAllSessions.
 */
export async function changePassword(
  deps: Dependencies,
  input: ChangePasswordInput
): Promise<Result<User>> {
  const validated = validateChangePasswordInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;

  const userId = asEntityId(v.userId);
  const user = deps.store.getUser(userId);
  if (!user) {
    return err(ErrorCode.NOT_FOUND, "user not found");
  }

  const credential = deps.store.getCredential(userId);
  if (!credential) {
    return err(ErrorCode.NOT_FOUND, "credential not found");
  }

  const currentOk = await verifyPassword(v.currentPassword, {
    hash: credential.passwordHash,
    salt: credential.salt,
    algorithm: credential.algorithm,
    costN: credential.costN,
    blockSizeR: credential.blockSizeR,
    parallelizationP: credential.parallelizationP,
  });
  if (!currentOk) {
    return err(ErrorCode.INVALID_INPUT, "current password is incorrect");
  }

  const hashed = await hashPassword(v.newPassword);
  const now = new Date().toISOString();
  const updatedCredential: UserCredential = {
    ...credential,
    passwordHash: hashed.hash,
    salt: hashed.salt,
    costN: hashed.costN,
    blockSizeR: hashed.blockSizeR,
    parallelizationP: hashed.parallelizationP,
    updatedAt: now,
  };
  deps.store.putCredential(updatedCredential);

  deps.audit.record(
    createAuditEntry({
      tenantId: "_platform" as any,
      actorUserId: asUserId(userId),
      componentId: "core/identity",
      action: "identity.password.changed",
      entityType: "user",
      entityId: userId,
      details: {},
    })
  );

  return ok(user);
}

/**
 * Revoke all sessions for a user. Called after a password change if the
 * user wants to log out everywhere, or by an admin suspending a user.
 */
export function revokeAllSessions(deps: Dependencies, userId: EntityId): Result<number> {
  const sessions = deps.store.listSessionsForUser(userId);
  let count = 0;
  const now = new Date().toISOString();
  for (const s of sessions) {
    if (s.status === "active") {
      deps.store.putSession({ ...s, status: "revoked" });
      count++;
    }
  }
  if (count > 0) {
    deps.audit.record(
      createAuditEntry({
        tenantId: "_platform" as any,
        actorUserId: asUserId(userId),
        componentId: "core/identity",
        action: "identity.sessions.revoked_all",
        entityType: "session",
        entityId: userId,
        details: { count },
      })
    );
  }
  return ok(count);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createSessionRecord(
  userId: EntityId,
  config: IdentityConfig,
  ip: string | null,
  userAgent: string | null
): Session {
  const now = new Date();
  const id = asEntityId("sess_" + Math.random().toString(36).slice(2, 12));
  const token = generateSessionToken();
  const expiresAt = new Date(now.getTime() + config.sessionLifetimeSeconds * 1000).toISOString();
  return {
    id,
    userId,
    token,
    createdAt: now.toISOString(),
    expiresAt,
    lastSeenAt: now.toISOString(),
    createdByIp: ip,
    createdByUserAgent: userAgent,
    status: "active",
  };
}
