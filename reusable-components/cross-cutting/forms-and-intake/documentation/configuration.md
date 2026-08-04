# Configuration Reference — `forms-and-intake`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxFieldsPerForm` | `number` | `50` | Cap on fields per form. |
| `maxSubmissionsPerForm` | `number` | `10000` | Cap on submissions stored per form. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/forms-and-intake/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxFieldsPerForm: /* your value */,  // override only what changes
};
```
