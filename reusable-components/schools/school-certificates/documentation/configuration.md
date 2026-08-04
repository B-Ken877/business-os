# Configuration Reference — `school-certificates`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `certificateTemplateKey` | `string` | `"default_graduation"` | Default template key. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-certificates/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  certificateTemplateKey: /* your value */,  // override only what changes
};
```
