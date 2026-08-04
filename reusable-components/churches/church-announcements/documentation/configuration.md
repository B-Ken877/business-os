# Configuration Reference — `church-announcements`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultExpiryDays` | `number` | `7` | Default days until an announcement expires. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/churches/church-announcements/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultExpiryDays: /* your value */,  // override only what changes
};
```
