# Configuration Reference — `notifications-center`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultExpiryHours` | `number` | `168` | Hours after which a notification expires (default 7 days). |
| `maxPerUser` | `number` | `1000` | Cap on notifications stored per user; oldest are pruned. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/notifications-center/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultExpiryHours: /* your value */,  // override only what changes
};
```
