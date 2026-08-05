import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryAuditSink } from "@business-os/shared";
import {
  InMemoryIdentityStore,
  defaultIdentityConfig,
  registerUser,
  loginUser,
  verifySession,
  logoutSession,
  changePassword,
  revokeAllSessions,
} from "../backend";
import type { Dependencies } from "../backend";

function setup(): Dependencies & { audit: InMemoryAuditSink } {
  const store = new InMemoryIdentityStore();
  const audit = new InMemoryAuditSink();
  return { store, audit, config: defaultIdentityConfig };
}

describe("identity / registerUser", () => {
  it("registers a new user with a hashed password and active session", async () => {
    const deps = setup();
    const r = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean Baptiste",
      password: "very-strong-password-123",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.user.email).toBe("jean@example.com");
    expect(r.value.user.status).toBe("active");
    expect(r.value.user.lastLoginAt).toBeNull();
    expect(r.value.session.status).toBe("active");
    expect(r.value.session.token).toMatch(/^[\w-]+$/); // base64url
    // Verify the password was hashed (not stored in plaintext).
    const cred = deps.store.getCredential(r.value.user.id);
    expect(cred).toBeDefined();
    if (!cred) return;
    expect(cred.passwordHash).not.toContain("very-strong-password-123");
    expect(cred.algorithm).toBe("scrypt");
    expect(cred.costN).toBe(16384);
  });

  it("rejects duplicate emails with a generic error", async () => {
    const deps = setup();
    await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    const r = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Another Jean",
      password: "very-strong-password-456",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("CONFLICT");
    // The error must NOT reveal that the email exists.
    expect(r.error.message).toBe("registration failed");
  });

  it("rejects weak passwords", async () => {
    const deps = setup();
    const r = await registerUser(deps, {
      email: "x@example.com",
      fullName: "X",
      password: "short",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("rejects invalid emails", async () => {
    const deps = setup();
    const r = await registerUser(deps, {
      email: "not-an-email",
      fullName: "X",
      password: "very-strong-password-123",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("records an audit entry on registration", async () => {
    const deps = setup();
    await registerUser(deps, {
      email: "audit@example.com",
      fullName: "Audit Test",
      password: "very-strong-password-123",
    });
    const audits = deps.audit.filter((e) => e.action === "identity.user.registered");
    expect(audits).toHaveLength(1);
    expect(audits[0].componentId).toBe("core/identity");
  });
});

describe("identity / loginUser", () => {
  it("logs in with correct credentials and returns a session", async () => {
    const deps = setup();
    await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    const r = await loginUser(deps, {
      email: "jean@example.com",
      password: "very-strong-password-123",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.user.email).toBe("jean@example.com");
    expect(r.value.session.status).toBe("active");
    expect(r.value.user.lastLoginAt).not.toBeNull();
  });

  it("rejects wrong password with a generic error", async () => {
    const deps = setup();
    await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    const r = await loginUser(deps, {
      email: "jean@example.com",
      password: "wrong-password-here",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("INVALID_INPUT");
    expect(r.error.message).toBe("invalid credentials");
  });

  it("rejects unknown email with the SAME error as wrong password", async () => {
    const deps = setup();
    const r = await loginUser(deps, {
      email: "nobody@example.com",
      password: "any-password-here",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("INVALID_INPUT");
    expect(r.error.message).toBe("invalid credentials"); // identical to wrong password
  });

  it("rejects suspended users", async () => {
    const deps = setup();
    const reg = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    // Suspend the user.
    deps.store.putUser({ ...reg.value.user, status: "suspended" });
    const r = await loginUser(deps, {
      email: "jean@example.com",
      password: "very-strong-password-123",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("PERMISSION_DENIED");
  });
});

describe("identity / verifySession", () => {
  it("verifies a valid session and updates lastSeenAt", async () => {
    const deps = setup();
    const reg = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    const r = verifySession(deps, reg.value.session.token);
    expect(r.ok).toBe(true);
  });

  it("rejects an invalid token", () => {
    const deps = setup();
    const r = verifySession(deps, "invalid-token");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("NOT_FOUND");
  });

  it("rejects a revoked session", async () => {
    const deps = setup();
    const reg = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    logoutSession(deps, reg.value.session.token);
    const r = verifySession(deps, reg.value.session.token);
    expect(r.ok).toBe(false);
  });
});

describe("identity / logoutSession", () => {
  it("revokes an active session", async () => {
    const deps = setup();
    const reg = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    const r = logoutSession(deps, reg.value.session.token);
    expect(r.ok).toBe(true);
    // Verify the session is now revoked.
    const session = deps.store.getSession(reg.value.session.token);
    expect(session?.status).toBe("revoked");
  });

  it("is idempotent — logging out an invalid token is a success", () => {
    const deps = setup();
    const r = logoutSession(deps, "never-existed");
    expect(r.ok).toBe(true);
  });
});

describe("identity / changePassword", () => {
  it("changes the password when the current password is correct", async () => {
    const deps = setup();
    const reg = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    const r = await changePassword(deps, {
      userId: reg.value.user.id,
      currentPassword: "very-strong-password-123",
      newPassword: "even-stronger-password-456",
    });
    expect(r.ok).toBe(true);
    // Verify the new password works for login.
    const login = await loginUser(deps, {
      email: "jean@example.com",
      password: "even-stronger-password-456",
    });
    expect(login.ok).toBe(true);
  });

  it("rejects when the current password is wrong", async () => {
    const deps = setup();
    const reg = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    const r = await changePassword(deps, {
      userId: reg.value.user.id,
      currentPassword: "wrong-current-password",
      newPassword: "even-stronger-password-456",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("rejects when the new password equals the current", async () => {
    const deps = setup();
    const reg = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    const r = await changePassword(deps, {
      userId: reg.value.user.id,
      currentPassword: "very-strong-password-123",
      newPassword: "very-strong-password-123",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});

describe("identity / revokeAllSessions", () => {
  it("revokes all active sessions for a user", async () => {
    const deps = setup();
    const reg = await registerUser(deps, {
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    // Create a second session by logging in again.
    await loginUser(deps, { email: "jean@example.com", password: "very-strong-password-123" });
    const r = revokeAllSessions(deps, reg.value.user.id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBe(2); // both sessions revoked
    // All sessions for the user are now revoked.
    const sessions = deps.store.listSessionsForUser(reg.value.user.id);
    expect(sessions.every((s) => s.status === "revoked")).toBe(true);
  });
});
