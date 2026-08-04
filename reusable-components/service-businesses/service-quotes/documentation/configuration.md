# Configuration Reference — `service-quotes`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultExpiryDays` | `number` | `30` | Default quote validity days. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/service-businesses/service-quotes/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultExpiryDays: /* your value */,  // override only what changes
};
```
