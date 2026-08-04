# Configuration Reference — `document-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxFileSizeBytes` | `number` | `10485760` | Hard cap on a single file's size (10 MB default). |
| `allowedMimeTypes` | `ReadonlyArray<string>` | `["application/pdf","image/png","image/jpeg"]` | MIME types accepted by default. |
| `retentionDaysAfterDelete` | `number` | `30` | Days a soft-deleted document is kept before hard purge. |
| `tenantStorageQuotaBytes` | `number` | `1073741824` | Per-tenant storage cap (1 GB default). |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/document-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxFileSizeBytes: /* your value */,  // override only what changes
};
```
