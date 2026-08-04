# core/organizations

> Tenants (organizations), membership, and invitations — the multi-tenancy foundation.

**Module ID:** `core/organizations`
**Layer:** 1 (Core)
**Stability:** stable — tenant isolation depends on this module.

---

## Purpose

Manage the platform's representation of a business (an "organization" / "tenant") and the users who belong to each. Every record on the platform belongs to exactly one organization; this module defines what an organization is and how users join one.

## Business problem solved

Per `ai-instructions/architecture-rules.md` §3, Business OS is multi-tenant by design — one platform serves many businesses, and tenant isolation is enforced at every layer. This module is the source of truth for "which tenant is this?" and "is this user a member of this tenant?"

Without it, every component would have to invent its own notion of "tenant," with no consistent way to resolve tenants from requests, no way to manage memberships, and no way to invite new users.

## Features

- Create an organization (the creator becomes the owner)
- Invite a user (by email) to join an organization with a specific role
- Accept an invitation (creates an active membership)
- Revoke a membership (with protection against revoking the last owner)
- List organizations for a user (the "organization switcher")
- Resolve a tenant by slug (used by the HTTP tenant-resolver middleware)

## Dependencies

- `@business-os/shared` — `TenantId`, `EntityId`, `AuditSink`, `Result`, `ErrorCode`.
- Node.js built-in `crypto` (for invitation tokens).

## Configuration options

| Key | Type | Default | Description |
|---|---|---|---|
| `invitationExpiryHours` | `number` | `168` | Hours before an invitation expires (7 days). |
| `maxMembersPerOrganization` | `number` | `100` | Hard cap on active members per organization. |

## Permissions required

Organizations operations enforce these permissions at the HTTP layer (not in this module's logic, because some operations are bootstrapping):

- `organization.invite` — to send invitations
- `organization.manage_members` — to revoke memberships
- `authenticated` — to create an organization or accept an invitation
- `public` — to resolve a tenant by slug (used before the user is authenticated)

## Data handled

- **Organization name, slug, industry** — public metadata about the business.
- **Membership records** — which user belongs to which organization, with what role. Reveals organizational structure.
- **Invitation tokens** — single-use, time-limited. Sent by email.

Membership data is sensitive (reveals who works where); access is limited to members of the same organization.

## API interfaces

See `api/contract.ts` for the HTTP routes and `documentation/contract.md` for the operation-level contract.

## Limitations

- **No role inheritance** — a user has exactly one role per organization.
- **No email sending** — invitations generate a token; the actual email is sent by the future `core/notifications` module.
- **No domain-based tenant resolution** — tenants are resolved by slug only. A future version will support custom domains.

## Future improvements

- Custom domains per organization.
- Role inheritance (e.g. "manager implies member").
- Domain-based auto-join (anyone with `@business.com` email joins the organization).
- Organization-level settings (timezone, locale, currency).
