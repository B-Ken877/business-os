# Configuration Reference — `notes-and-comments`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxNoteLength` | `number` | `5000` | Maximum characters per note body. |
| `maxThreadDepth` | `number` | `5` | Maximum nesting depth for threaded replies. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/notes-and-comments/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxNoteLength: /* your value */,  // override only what changes
};
```
