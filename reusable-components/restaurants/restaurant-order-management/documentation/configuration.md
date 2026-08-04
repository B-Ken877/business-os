# Configuration Reference — `restaurant-order-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxItemsPerOrder` | `number` | `50` | Cap on line items per order. |
| `defaultFulfillmentType` | `string` | `"dine_in"` | Default fulfillment type. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-order-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxItemsPerOrder: /* your value */,  // override only what changes
};
```
