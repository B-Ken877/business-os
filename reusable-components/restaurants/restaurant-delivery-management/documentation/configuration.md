# Configuration Reference — `restaurant-delivery-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxActiveDeliveriesPerDriver` | `number` | `3` | Cap on simultaneous deliveries per driver. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-delivery-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxActiveDeliveriesPerDriver: /* your value */,  // override only what changes
};
```
