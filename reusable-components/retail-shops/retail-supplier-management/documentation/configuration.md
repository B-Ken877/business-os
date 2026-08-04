# Configuration Reference — `retail-supplier-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultPaymentTermsDays` | `number` | `30` | Default payment terms (days). |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/retail-shops/retail-supplier-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultPaymentTermsDays: /* your value */,  // override only what changes
};
```
