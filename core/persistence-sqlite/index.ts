/**
 * Public barrel for the SQLite persistence adapter.
 *
 * Consumers (the HTTP server, integration tests) import from here.
 */

export { openDatabase } from "./database";
export type { SqliteOptions, DatabaseType } from "./database";
export { SqliteIdentityStore } from "./stores/identity-store";
export { SqliteOrganizationsStore } from "./stores/organizations-store";
export { SqliteAuthorizationStore } from "./stores/authorization-store";
export { SqliteAuditLogStore } from "./stores/audit-log-store";

/**
 * Convenience: create all 4 stores from a single database connection.
 */
import type { DatabaseType } from "./database";
import { SqliteIdentityStore } from "./stores/identity-store";
import { SqliteOrganizationsStore } from "./stores/organizations-store";
import { SqliteAuthorizationStore } from "./stores/authorization-store";
import { SqliteAuditLogStore } from "./stores/audit-log-store";

export function createStores(db: DatabaseType) {
  return {
    identity: new SqliteIdentityStore(db),
    organizations: new SqliteOrganizationsStore(db),
    authorization: new SqliteAuthorizationStore(db),
    auditLog: new SqliteAuditLogStore(db),
  };
}
