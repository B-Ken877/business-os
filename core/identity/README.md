# core/identity

> User accounts, password hashing, and session management — the front door to the platform.

**Module ID:** `core/identity`
**Layer:** 1 (Core)
**Stability:** stable — changes here break every authenticated path on the platform.

---

## Purpose

Manage user identities and authenticated sessions. A user is the platform-wide identity that logs in; a session is the proof of that login. This module knows nothing about tenants, roles, or business capabilities — it only answers "who is this user?" and "is their session valid right now?"

## Business problem solved

Every business on the platform needs authentication. Without a central identity module, every component would reinvent login, password storage, and session management — with inconsistent security, no audit trail, and no way to revoke access platform-wide.

This module centralises authentication per `ai-instructions/security-rules.md` §2:
- Passwords hashed with scrypt (one of the three approved algorithms), 128-bit salt, OWASP-recommended cost parameters.
- Sessions are opaque 256-bit tokens, server-side revocable, with absolute and idle timeouts.
- Login failures return a generic "invalid credentials" error to prevent user enumeration.

## Features

- Register a new user with email + password
- Login with email + password (returns a session token)
- Verify a session token (used by every authenticated API route)
- Logout (revoke the current session)
- Change password (requires the current password)
- Revoke all sessions for a user (after password compromise or admin suspension)

## Dependencies

- `@business-os/shared` — `TenantContext`, `AuditSink`, `Result`, `EntityId`, `ErrorCode`.
- Node.js built-in `crypto` module (for scrypt and random bytes). No external dependencies.

## Configuration options

| Key | Type | Default | Description |
|---|---|---|---|
| `sessionLifetimeSeconds` | `number` | `604800` | Absolute session lifetime (7 days). |
| `idleTimeoutSeconds` | `number` | `1800` | Idle timeout (30 minutes). |

## Permissions required

Identity operations are **bootstrapping** — they cannot require permissions because the user does not exist yet. The HTTP layer enforces that:

- `POST /v1/identity/register` and `POST /v1/identity/login` are public.
- All other routes require `authenticated` (any logged-in user).
- A user can only change their own password or revoke their own sessions.

## Data handled

- **Email addresses** — the primary login identifier. Unique platform-wide.
- **Password hashes** — scrypt-hashed, never plaintext. Stored separately from the user record.
- **Session tokens** — opaque, 256-bit, server-side revocable.
- **IP address and user-agent** — recorded at session creation for audit.

Sensitive. All data is encrypted at rest by the database layer (when wired up). Password hashes are never logged.

## API interfaces

The HTTP-shaped contract is in `api/contract.ts`. The operation-level contract is in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract.

## Limitations

- **No MFA yet.** The module is designed to support TOTP (RFC 6238) in the future, but the MFA enrollment and verification flows are not implemented.
- **No password reset flow.** A future version will add single-use, time-limited reset tokens delivered via email.
- **No "Have I Been Pwned" integration.** The password policy checks length only; a future version will reject compromised passwords via the HIBP range API.
- **No email verification.** Registration assumes the email is valid; a future version will send a verification link.
- **In-memory store only.** The `InMemoryIdentityStore` is for tests and early development. A Postgres adapter is the next step.

## Future improvements

- MFA via TOTP, with recovery codes.
- Password reset via email-delivered single-use tokens.
- Email verification on registration.
- HIBP range API integration.
- WebAuthn / FIDO2 for hardware security keys.
- Session device tracking with "log out other devices" UI.

---

## Folder layout

```
core/identity/
├── README.md                  (this file)
├── backend/
│   ├── types.ts               (User, UserCredential, Session)
│   ├── passwords.ts           (scrypt hashing, verification, policy)
│   ├── validation.ts          (input validation)
│   ├── logic.ts               (operations + audit)
│   └── index.ts               (public barrel)
├── database/
│   └── schema.ts              (row types + index hints)
├── api/
│   └── contract.ts            (HTTP route declarations)
├── config/
│   ├── schema.ts
│   └── defaults.ts
├── tests/
│   ├── logic.test.ts          (register, login, verify, logout, change, revoke)
│   ├── validation.test.ts     (input validation per field)
│   └── passwords.test.ts      (hashing, verification, policy, token generation)
└── examples/
    └── basic-usage.ts
```
