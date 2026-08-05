import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  assertPasswordPolicy,
  WeakPasswordError,
} from "../backend/passwords";

describe("identity / password hashing", () => {
  it("hashes a password with scrypt and a random salt", async () => {
    const h = await hashPassword("my-strong-password-123");
    expect(h.algorithm).toBe("scrypt");
    expect(h.costN).toBe(16384);
    expect(h.blockSizeR).toBe(8);
    expect(h.parallelizationP).toBe(1);
    expect(h.hash).not.toBe("my-strong-password-123");
    expect(h.salt).not.toBe("");
    // Two hashes of the same password must differ (random salt).
    const h2 = await hashPassword("my-strong-password-123");
    expect(h.hash).not.toBe(h2.hash);
    expect(h.salt).not.toBe(h2.salt);
  });

  it("verifies a correct password", async () => {
    const h = await hashPassword("correct-password-123");
    const ok = await verifyPassword("correct-password-123", h);
    expect(ok).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const h = await hashPassword("correct-password-123");
    const ok = await verifyPassword("wrong-password-here", h);
    expect(ok).toBe(false);
  });

  it("rejects unknown algorithms", async () => {
    const ok = await verifyPassword("anything", {
      hash: "x",
      salt: "y",
      algorithm: "md5" as any,
      costN: 16384,
      blockSizeR: 8,
      parallelizationP: 1,
    });
    expect(ok).toBe(false);
  });
});

describe("identity / password policy", () => {
  it("accepts passwords of 12+ characters", () => {
    expect(() => assertPasswordPolicy("twelve-chars")).not.toThrow();
    expect(() => assertPasswordPolicy("a-very-long-and-strong-password-123")).not.toThrow();
  });
  it("rejects passwords shorter than 12 characters", () => {
    expect(() => assertPasswordPolicy("short")).toThrow(WeakPasswordError);
    expect(() => assertPasswordPolicy("eleven!")).toThrow(WeakPasswordError); // 7 chars
    expect(() => assertPasswordPolicy("exactly-12-c")).not.toThrow(); // exactly 12 chars — boundary
  });
  it("rejects empty passwords", () => {
    expect(() => assertPasswordPolicy("")).toThrow(WeakPasswordError);
  });
  it("rejects passwords over 1024 characters", () => {
    expect(() => assertPasswordPolicy("x".repeat(1025))).toThrow(WeakPasswordError);
  });
});

describe("identity / session token generation", () => {
  it("generates a base64url token with sufficient entropy", () => {
    const t1 = generateSessionToken();
    const t2 = generateSessionToken();
    expect(t1).not.toBe(t2);
    // 32 bytes base64url-encoded is ~43 chars.
    expect(t1.length).toBeGreaterThanOrEqual(40);
    expect(t1).toMatch(/^[\w-]+$/); // base64url charset
  });
});
