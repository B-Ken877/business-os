/**
 * Password hashing using Node's built-in crypto.scrypt.
 *
 * Why scrypt (not bcrypt or Argon2id)?
 *   - scrypt is built into Node.js (`crypto.scrypt`), so no native dependency.
 *   - It is one of the three algorithms approved by security-rules.md §2.
 *   - It is memory-hard, resistant to GPU/ASIC attacks.
 *
 * Parameters chosen for production:
 *   - N = 16384 (CPU/memory cost — 2^14)
 *   - r = 8 (block size)
 *   - p = 1 (parallelization)
 *
 * These are the OWASP-recommended values as of 2024. They take ~100ms per
 * hash on a typical server, which is the right tradeoff for security vs UX.
 */

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: { N?: number; r?: number; p?: number; maxmem?: number }
) => Promise<Buffer>;

const KEY_LENGTH = 64; // 512 bits
const SALT_LENGTH = 16; // 128 bits
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };

export interface HashedPassword {
  readonly hash: string; // base64
  readonly salt: string; // base64
  readonly algorithm: "scrypt";
  readonly costN: number;
  readonly blockSizeR: number;
  readonly parallelizationP: number;
}

/**
 * Hash a password with a freshly-generated random salt.
 * Returns the hash + salt + parameters needed to verify later.
 */
export async function hashPassword(plaintext: string): Promise<HashedPassword> {
  assertPasswordPolicy(plaintext);
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scrypt(plaintext, salt, KEY_LENGTH, PARAMS);
  return {
    hash: hash.toString("base64"),
    salt: salt.toString("base64"),
    algorithm: "scrypt",
    costN: PARAMS.N,
    blockSizeR: PARAMS.r,
    parallelizationP: PARAMS.p,
  };
}

/**
 * Verify a plaintext password against a stored hash.
 * Uses timingSafeEqual to prevent timing attacks.
 * Returns true on match, false otherwise — never throws on mismatch.
 */
export async function verifyPassword(
  plaintext: string,
  stored: HashedPassword
): Promise<boolean> {
  if (stored.algorithm !== "scrypt") {
    return false; // unknown algorithm — refuse to verify
  }
  const salt = Buffer.from(stored.salt, "base64");
  const expected = Buffer.from(stored.hash, "base64");
  const actual = await scrypt(plaintext, salt, expected.length, {
    N: stored.costN,
    r: stored.blockSizeR,
    p: stored.parallelizationP,
    maxmem: 32 * 1024 * 1024,
  });
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/**
 * Enforce the platform password policy per security-rules.md §2:
 *   - minimum 12 characters
 *   - reject empty
 *
 * We deliberately do NOT enforce complexity rules (uppercase, symbol, etc.)
 * because they lead to predictable passwords like "Summer2024!". Length is
 * the strongest single predictor of password strength.
 *
 * A future version will integrate Have I Been Pwned's range API to reject
 * compromised passwords.
 */
export function assertPasswordPolicy(plaintext: string): void {
  if (typeof plaintext !== "string" || plaintext.length < 12) {
    throw new WeakPasswordError("password must be at least 12 characters");
  }
  if (plaintext.length > 1024) {
    throw new WeakPasswordError("password must be at most 1024 characters");
  }
}

export class WeakPasswordError extends Error {
  readonly code = "WEAK_PASSWORD";
  constructor(message: string) {
    super(message);
    this.name = "WeakPasswordError";
  }
}

/**
 * Generate a cryptographically random session token.
 * 32 bytes = 256 bits of entropy, well above the 128-bit minimum in
 * security-rules.md §2.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}
