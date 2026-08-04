# Configuration Reference — `service-customer-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxCustomersPerTenant` | `number` | `50000` | Cap on customer records. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/service-businesses/service-customer-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxCustomersPerTenant: /* your value */,  // override only what changes
};
```
