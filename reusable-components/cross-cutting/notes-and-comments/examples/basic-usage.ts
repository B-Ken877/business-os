/**
 * Minimal usage example for the notes-and-comments component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryNotesAndCommentsStore,
  createNote,
  listNotesForEntity,
  deleteNote,
} from "../backend";

async function main() {
  const store = new InMemoryNotesAndCommentsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "notes.create",
        "notes.read",
        "notes.update",
        "notes.delete",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxNoteLength: 5000,
    maxThreadDepth: 5,
  } };

  console.log("notes-and-comments ready.");
  console.log("Operations available:", ['createNote', 'listNotesForEntity', 'deleteNote'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
