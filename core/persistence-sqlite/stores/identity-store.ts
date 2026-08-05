/**
 * SQLite implementation of the IdentityStore interface (from core/identity).
 */

import type { DatabaseType } from "../database";
import type { EntityId } from "@business-os/shared";
import type { User, UserCredential, Session } from "@business-os/core/identity";
import type { IdentityStore } from "@business-os/core/identity";

interface UserRow {
  id: string; email: string; full_name: string; status: string;
  last_login_at: string | null; created_at: string; updated_at: string;
}
interface CredentialRow {
  id: string; user_id: string; password_hash: string; salt: string;
  algorithm: string; cost_n: number; block_size_r: number; parallelization_p: number;
  created_at: string; updated_at: string;
}
interface SessionRow {
  id: string; user_id: string; token: string; created_at: string;
  expires_at: string; last_seen_at: string; created_by_ip: string | null;
  created_by_user_agent: string | null; status: string;
}

function rowToUser(r: UserRow): User {
  return {
    id: r.id as EntityId, email: r.email, fullName: r.full_name,
    status: r.status as User["status"], lastLoginAt: r.last_login_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function rowToCredential(r: CredentialRow): UserCredential {
  return {
    id: r.id as EntityId, userId: r.user_id as EntityId,
    passwordHash: r.password_hash, salt: r.salt,
    algorithm: r.algorithm as "scrypt", costN: r.cost_n,
    blockSizeR: r.block_size_r, parallelizationP: r.parallelization_p,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function rowToSession(r: SessionRow): Session {
  return {
    id: r.id as EntityId, userId: r.user_id as EntityId, token: r.token,
    createdAt: r.created_at, expiresAt: r.expires_at, lastSeenAt: r.last_seen_at,
    createdByIp: r.created_by_ip, createdByUserAgent: r.created_by_user_agent,
    status: r.status as Session["status"],
  };
}

export class SqliteIdentityStore implements IdentityStore {
  constructor(private readonly db: DatabaseType) {}

  getUser(id: EntityId): User | undefined {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
    return row ? rowToUser(row) : undefined;
  }

  getUserByEmail(email: string): User | undefined {
    const row = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
    return row ? rowToUser(row) : undefined;
  }

  putUser(user: User): void {
    this.db.prepare(`
      INSERT INTO users (id, email, full_name, status, last_login_at, created_at, updated_at)
      VALUES (@id, @email, @full_name, @status, @last_login_at, @created_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        email = @email, full_name = @full_name, status = @status,
        last_login_at = @last_login_at, updated_at = @updated_at
    `).run({
      id: user.id, email: user.email, full_name: user.fullName,
      status: user.status, last_login_at: user.lastLoginAt,
      created_at: user.createdAt, updated_at: user.updatedAt,
    });
  }

  listUsers(): readonly User[] {
    const rows = this.db.prepare("SELECT * FROM users").all() as UserRow[];
    return rows.map(rowToUser);
  }

  getCredential(userId: EntityId): UserCredential | undefined {
    const row = this.db.prepare("SELECT * FROM user_credentials WHERE user_id = ?").get(userId) as CredentialRow | undefined;
    return row ? rowToCredential(row) : undefined;
  }

  putCredential(credential: UserCredential): void {
    this.db.prepare(`
      INSERT INTO user_credentials (id, user_id, password_hash, salt, algorithm, cost_n, block_size_r, parallelization_p, created_at, updated_at)
      VALUES (@id, @user_id, @password_hash, @salt, @algorithm, @cost_n, @block_size_r, @parallelization_p, @created_at, @updated_at)
      ON CONFLICT(user_id) DO UPDATE SET
        password_hash = @password_hash, salt = @salt, algorithm = @algorithm,
        cost_n = @cost_n, block_size_r = @block_size_r, parallelization_p = @parallelization_p,
        updated_at = @updated_at
    `).run({
      id: credential.id, user_id: credential.userId,
      password_hash: credential.passwordHash, salt: credential.salt,
      algorithm: credential.algorithm, cost_n: credential.costN,
      block_size_r: credential.blockSizeR, parallelization_p: credential.parallelizationP,
      created_at: credential.createdAt, updated_at: credential.updatedAt,
    });
  }

  getSession(token: string): Session | undefined {
    const row = this.db.prepare("SELECT * FROM sessions WHERE token = ?").get(token) as SessionRow | undefined;
    return row ? rowToSession(row) : undefined;
  }

  getSessionById(id: EntityId): Session | undefined {
    const row = this.db.prepare("SELECT * FROM sessions WHERE id = ?").get(id) as SessionRow | undefined;
    return row ? rowToSession(row) : undefined;
  }

  putSession(session: Session): void {
    this.db.prepare(`
      INSERT INTO sessions (id, user_id, token, created_at, expires_at, last_seen_at, created_by_ip, created_by_user_agent, status)
      VALUES (@id, @user_id, @token, @created_at, @expires_at, @last_seen_at, @created_by_ip, @created_by_user_agent, @status)
      ON CONFLICT(token) DO UPDATE SET
        last_seen_at = @last_seen_at, status = @status
    `).run({
      id: session.id, user_id: session.userId, token: session.token,
      created_at: session.createdAt, expires_at: session.expiresAt,
      last_seen_at: session.lastSeenAt, created_by_ip: session.createdByIp,
      created_by_user_agent: session.createdByUserAgent, status: session.status,
    });
  }

  listSessionsForUser(userId: EntityId): readonly Session[] {
    const rows = this.db.prepare("SELECT * FROM sessions WHERE user_id = ?").all(userId) as SessionRow[];
    return rows.map(rowToSession);
  }
}
