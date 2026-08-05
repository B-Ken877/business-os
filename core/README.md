# Core

> Layer 1 of Business OS — the universal foundation shared by every business, regardless of industry.

**Status:** partial — the security foundation (platform, identity, organizations, authorization, audit-log) is built and tested. Additional core modules (notifications, settings, file-storage, billing, http) are planned.

**Test status:** 1,121 tests passing across 202 test files (77 new core tests + 1,044 reusable-components tests still green). Run `npm test` from the repository root.

---

## What this layer is

`core/` holds capabilities that **every** business on the platform needs, regardless of industry. A church needs authentication. A clinic needs authentication. A restaurant needs authentication. Therefore authentication lives in core, is built once to a high standard, and is inherited by all.

Per `ai-instructions/architecture-rules.md` §2:
- Core must **never** contain industry-specific logic. A core module must not know that restaurants have menus, that schools have students, or that clinics have patients. If such knowledge appears necessary, the module belongs in Layer 2, not Layer 1.
- Core must be **stable**. Breaking changes ripple through every component, every template, and every business project. They are the most expensive changes on the platform.
- Changes to core require **careful review** and a documented migration plan.

---

## Module catalog

### Built (stable)

| Module | Purpose | Tests |
|---|---|---|
| `platform/` | Universal primitives — `TenantContext`, `PermissionChecker`, `Result`, `AuditSink`, `EntityId`, `ErrorCode`. Promoted from `reusable-components/_shared/`. | 18 |
| `identity/` | Users, scrypt password hashing, sessions, login/register/logout, password change, session revocation. | 36 |
| `organizations/` | Tenants (organizations), membership, invitations, tenant resolution by slug. | 14 |
| `authorization/` | Real `PermissionChecker` backed by a role store, system role seeding, custom roles, grants, revocation. Wildcard support (`*.*`, `retail.*`). | 16 |
| `audit-log/` | Production `AuditSink` that persists entries, queryable audit trail with filters + pagination, immutable (no update/delete). | 11 |
| `http/` (contract only) | Types-only module — `RouteContract`, `HttpRequest`, `HttpResponse`. The actual server comes later. | — |

### Planned (not yet built)

| Module | Purpose | Priority |
|---|---|---|
| `http/` (server) | Hono-style HTTP server, middleware (tenant resolver, auth, rate limit), wires `api/contract.ts` declarations to handlers. | Next |
| `notifications/` | Email/SMS/in-app channel abstraction + adapters (SMTP, Twilio, WhatsApp Business). | Next |
| `settings/` | Platform-wide + per-tenant config store. | Next |
| `file-storage/` | Storage adapter interface (S3, local FS). | Later |
| `billing/` | Platform SaaS billing (different from per-tenant `payments-or-collections`). | Later |

---

## How the modules fit together

A typical authenticated request flows through these modules:

1. **HTTP layer** (planned) receives the request, extracts the session token.
2. **`identity`** verifies the session token → returns the `User`.
3. **`organizations`** resolves the tenant from the request (by slug, subdomain, or header) → returns the `Organization`.
4. **`authorization`** checks that the user is a member of the tenant and has the required permission.
5. The **reusable component** (Layer 2) runs its operation, writing an audit entry via **`audit-log`**.
6. The HTTP layer returns the response.

```
Request → http → identity.verifySession
              → organizations.resolveTenant
              → authorization.checker.has
              → <component>.operation(ctx, deps, input)
                    → audit-log PersistentAuditSink.record
              → Response
```

---

## How to use the core modules

```ts
import { createTenantContext, InMemoryAuditSink } from "@business-os/shared";
import { InMemoryIdentityStore, registerUser, loginUser } from "@business-os/core/identity";
import { InMemoryOrganizationsStore, createOrganization } from "@business-os/core/organizations";
import {
  InMemoryAuthorizationStore,
  StorePermissionChecker,
  seedSystemRoles,
  grantRole,
} from "@business-os/core/authorization";
import { InMemoryAuditLogStore, PersistentAuditSink } from "@business-os/core/audit-log";

// 1. Register a user.
const identityStore = new InMemoryIdentityStore();
const auditLogStore = new InMemoryAuditLogStore();
const auditSink = new PersistentAuditSink(auditLogStore);
const { user, session } = await registerUser(
  { store: identityStore, audit: auditSink, config: defaultIdentityConfig },
  { email: "owner@example.com", fullName: "Owner", password: "very-strong-password-123" }
);

// 2. Create an organization (the user becomes the owner).
const orgStore = new InMemoryOrganizationsStore();
const { organization } = createOrganization(
  { store: orgStore, audit: auditSink, config: defaultOrganizationsConfig },
  { name: "Resto Lakou", slug: "resto-lakou", industry: "restaurants", creatorUserId: user.id }
);

// 3. Seed system roles + grant owner to the user.
const authzStore = new InMemoryAuthorizationStore();
seedSystemRoles(authzStore equivalent..., organization.id, user.id);
const ctx = createTenantContext({ tenantId: organization.id, userId: user.id });
grantRole({ store: authzStore, audit: auditSink, config: ... }, ctx, {
  userId: user.id,
  roleName: "owner",
});

// 4. Now any reusable component can be called with this ctx + a StorePermissionChecker.
const checker = new StorePermissionChecker(authzStore);
const deps = {
  store: new InMemoryRetailInventoryStore(),
  permissions: checker,
  audit: auditSink,
  config: defaultConfig,
};
const result = adjustStock(ctx, deps, { productId: "p-1", delta: 10, reason: "restock" });
```

In production, the in-memory stores are replaced with platform-backed adapters (Postgres). The component logic does not change — only the injected dependencies do.

---

## Shared primitives (`platform/`)

The `platform/` folder holds the absolute foundation — types and helpers that every other module (core or reusable component) depends on:

- `TenantContext`, `TenantId`, `UserId`, `assertSameTenant`, `TenantIsolationError`
- `PermissionChecker` interface, `InMemoryPermissionChecker`, `DenyAllPermissionChecker`, `PermissionDeniedError`
- `Result<T, E>`, `ok()`, `err()`, `isOk()`, `isErr()`, `ErrorCode`
- `AuditEntry`, `AuditSink` interface, `InMemoryAuditSink`, `createAuditEntry()`
- `EntityId`, `asEntityId()`, `generateId()`

These are imported via the `@business-os/shared` alias (which points at `core/platform/index.ts`). A backwards-compatibility shim remains at `reusable-components/_shared/index.ts` for any code that has not yet migrated.

---

## Testing

Every core module includes test files covering:

- **Happy path** — the operation works as documented.
- **Validation** — invalid inputs return `Result.err` with the correct error code.
- **Business rules** — state machine transitions, conflict detection, caps.
- **Security** — permission denial, tenant isolation, no information leakage on auth failure.
- **Immutability** — for audit-log, no update/delete methods exist on the store interface.

Run all tests:

```bash
npm test
```

Run only core tests:

```bash
npx vitest run core
```

---

## Relation to the constitution

This layer is governed by:
- `ai-instructions/architecture-rules.md` §1 (philosophy), §2 (layers), §3 (multi-tenancy)
- `ai-instructions/security-rules.md` §2 (authentication), §3 (authorization), §4 (data security)
- `ai-instructions/component-standard.md` §3 (structure), §4 (documentation)

Every module follows the same standard structure as reusable components: `README.md`, `component.json` (where applicable), `backend/`, `database/`, `api/`, `config/`, `tests/`, `examples/`.
