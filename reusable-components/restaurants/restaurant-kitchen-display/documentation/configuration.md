# Configuration Reference — `restaurant-kitchen-display`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxTicketsPerStation` | `number` | `50` | Cap on open tickets per station. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-kitchen-display/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxTicketsPerStation: /* your value */,  // override only what changes
};
```
