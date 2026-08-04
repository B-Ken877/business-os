# Configuration Reference — `service-booking`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `slotGranularityMinutes` | `number` | `15` | Slot granularity for conflict detection. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/service-businesses/service-booking/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  slotGranularityMinutes: /* your value */,  // override only what changes
};
```
