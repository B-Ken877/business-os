# core/persistence-sqlite

> SQLite persistence adapter — implements every core store interface against a single SQLite database file.

**Module ID:** `core/persistence-sqlite`
**Layer:** 1 (Core) — infrastructure adapter
**Stability:** stable

---

## Purpose

Replace the in-memory stores (`InMemoryIdentityStore`, etc.) with real persistence. SQLite is zero-config (just a file path), persistent, and production-viable for small-to-medium businesses — exactly the platform's target market.

## Why SQLite (not Postgres)

Per the user's constraint: "no manual setup like external DB." SQLite requires no server process, no installation, no credentials — it's just a file. The database is created automatically on first run.

The store interfaces are already declared in each core module, so swapping to Postgres later is "implement the same interfaces against `pg`," not "redesign the data model."

## What this module provides

- `openDatabase(options?)` — opens a SQLite database, runs migrations, returns the connection.
- `SqliteIdentityStore` — implements `IdentityStore` from `core/identity`.
- `SqliteOrganizationsStore` — implements `OrganizationsStore` from `core/organizations`.
- `SqliteAuthorizationStore` — implements `AuthorizationStore` from `core/authorization`.
- `SqliteAuditLogStore` — implements `AuditLogStore` from `core/audit-log` (append-only — no update/delete).
- `createStores(db)` — convenience: creates all 4 stores from one connection.

## Configuration

| Env var | Default | Description |
|---|---|---|
| `DATABASE_PATH` | `./data/business-os.db` | Path to the SQLite file. Use `:memory:` for tests. |

## Migrations

SQL files live in `schema/` and are run automatically on `openDatabase()`. All statements use `CREATE TABLE IF NOT EXISTS`, so re-running is safe. A future version will add a proper migration runner with version tracking.

## Audit log immutability

The `audit_log` table has no `UPDATE` or `DELETE` statements anywhere in the codebase. The `SqliteAuditLogStore` class exposes only `record()`, `list()`, and `count()` — there is no `update()` or `delete()` method. This enforces the append-only requirement from `security-rules.md` §5 at the code level.

## Dependencies

- `better-sqlite3` — the fastest Node.js SQLite driver (synchronous, C++ binding with prebuilt binaries for common platforms).
