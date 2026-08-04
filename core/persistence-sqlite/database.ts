/**
 * SQLite database connection + schema migration runner.
 *
 * Uses better-sqlite3 (synchronous, fastest Node.js SQLite driver).
 * The database file is created automatically on first run — no manual
 * setup required. Set DATABASE_PATH env var to override the default
 * location.
 *
 * Per ai-instructions/architecture-rules.md §3 (Multi-Tenant Architecture):
 * every tenant-scoped table has a tenant_id column. The application layer
 * enforces scoping; this adapter does not need row-level security because
 * all queries go through the store interfaces which always filter by
 * tenantId.
 */

import Database from "better-sqlite3";
import { readFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database as DatabaseType } from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface SqliteOptions {
  /** Path to the database file. Use ':memory:' for tests. */
  readonly path?: string;
  /** Whether to run migrations on open. Default: true. */
  readonly migrate?: boolean;
  /** Enable WAL mode for better concurrent read performance. Default: true. */
  readonly wal?: boolean;
}

/**
 * Open a SQLite database, run migrations, and return the connection.
 *
 * The caller is responsible for closing the database (call `db.close()`)
 * when the process exits.
 */
export function openDatabase(options: SqliteOptions = {}): DatabaseType {
  const path = options.path ?? process.env.DATABASE_PATH ?? "./data/business-os.db";

  // Create the parent directory if it doesn't exist (for file-based databases).
  if (path !== ":memory:") {
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(path);

  if (options.wal !== false) {
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }

  if (options.migrate !== false) {
    runMigrations(db);
  }

  return db;
}

/**
 * Run all SQL files in the schema/ directory, in order.
 * Idempotent — every statement uses CREATE TABLE IF NOT EXISTS.
 */
function runMigrations(db: DatabaseType): void {
  const schemaDir = join(__dirname, "schema");
  const files = readdirSync(schemaDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(schemaDir, file), "utf-8");
    db.exec(sql);
  }
}

export type { DatabaseType };
