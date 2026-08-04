/**
 * Server entry point.
 *
 * Run with: npm start
 *
 * The server opens a SQLite database at DATABASE_PATH (default
 * ./data/business-os.db), runs migrations, and starts listening on
 * PORT (default 3000).
 *
 * No external setup required — the database file is created on first run.
 */

import { openDatabase, createStores, createRestaurantStores } from "./core/persistence-sqlite";
import { createApp } from "./core/http/server";
import { serve } from "@hono/node-server";

const PORT = Number(process.env.PORT ?? 3000);
const DB_PATH = process.env.DATABASE_PATH ?? "./data/business-os.db";

async function main() {
  console.log(`[server] opening database at ${DB_PATH}`);
  const db = openDatabase({ path: DB_PATH });
  const stores = createStores(db);
  const deps = {
    identity: stores.identity,
    organizations: stores.organizations,
    authorization: stores.authorization,
    auditLog: stores.auditLog,
  };

  // Inject SQLite stores for verticals that have persistence adapters.
  // Currently: restaurants (10 components). Other verticals use in-memory.
  const persistentStores = {
    ...createRestaurantStores(db),
  };

  const app = createApp(deps, persistentStores);

  console.log(`[server] listening on http://localhost:${PORT}`);
  serve({ fetch: app.fetch, port: PORT });

  // Graceful shutdown.
  process.on("SIGINT", () => {
    console.log("[server] shutting down");
    db.close();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    console.log("[server] shutting down");
    db.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[server] fatal error:", err);
  process.exit(1);
});
