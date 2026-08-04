# Document Management

> File uploads, document organization, attachments, and metadata.

**Component ID:** `document-management`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Provide a single, tenant-scoped surface for uploading, organizing, retrieving, and attaching files to any business entity (invoices, prescriptions, certificates, contracts, etc.).

## Business problem solved

Without a shared document store, every component that needs to handle files (a clinic storing prescriptions, a school storing report cards, a restaurant storing menu PDFs) reinvents file upload, validation, and access control. This component centralizes those concerns so files are stored once, indexed by tenant + entity, and access-controlled uniformly.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Upload a document with metadata (entityType, entityId, kind)
- Attach the same document to multiple entities (e.g. a shared contract)
- List documents by entity, by kind, or by tenant
- Soft-delete with retention window
- Per-tenant storage quota enforcement
- MIME-type allow-list per kind (e.g. prescriptions must be PDF)

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxFileSizeBytes` (`number`, default `10485760`) — Hard cap on a single file's size (10 MB default).
- `allowedMimeTypes` (`ReadonlyArray<string>`, default `["application/pdf","image/png","image/jpeg"]`) — MIME types accepted by default.
- `retentionDaysAfterDelete` (`number`, default `30`) — Days a soft-deleted document is kept before hard purge.
- `tenantStorageQuotaBytes` (`number`, default `1073741824`) — Per-tenant storage cap (1 GB default).

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `documents.upload`
- `documents.read`
- `documents.delete`
- `documents.manageQuota`

## Data handled

File content (potentially sensitive — prescriptions, contracts, ID scans), file metadata (name, size, MIME type, entity association), upload timestamp, uploader identity.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No actual byte storage — the platform's storage adapter (S3, local FS, etc.) is plugged in separately.
- No content-type sniffing — the caller-declared mimeType is trusted; a future version should verify magic bytes.
- No versioning — re-uploading the same file creates a new document, not a new version.

## Future improvements

- Virus scanning hook before the document becomes readable.
- Document-level access control (e.g. a prescription visible only to the prescribing doctor).
- Versioned documents with diff.

---

## Folder layout

```
document-management/
├── README.md                  (this file)
├── component.json             (machine-readable manifest)
├── documentation/
│   ├── contract.md            (API contract)
│   └── configuration.md       (config reference)
├── backend/
│   ├── types.ts               (domain types — the canonical contract)
│   ├── validation.ts          (input validation helpers)
│   ├── logic.ts               (operations + permission/audit enforcement)
│   └── index.ts               (public barrel)
├── database/
│   └── schema.ts              (data model — types only, no DB adapter yet)
├── api/
│   └── contract.ts            (HTTP-shaped contract — types only)
├── config/
│   ├── schema.ts              (config schema)
│   └── defaults.ts            (default values)
├── tests/
│   ├── logic.test.ts          (happy path + business rules)
│   ├── validation.test.ts     (input validation)
│   └── tenant-isolation.test.ts (cross-tenant access denial)
└── examples/
    └── basic-usage.ts
```
