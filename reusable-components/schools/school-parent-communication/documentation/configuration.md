# Configuration Reference — `school-parent-communication`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `broadcastRateLimitPerHour` | `number` | `10` | Cap on broadcasts per hour. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-parent-communication/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  broadcastRateLimitPerHour: /* your value */,  // override only what changes
};
```
