# Configuration Reference — `retail-stock-alerts`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `suppressDuplicateHours` | `number` | `6` | Hours to suppress a duplicate alert for the same product. |
| `alertRecipientRole` | `string` | `"manager"` | Role whose members receive alerts. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/retail-shops/retail-stock-alerts/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  suppressDuplicateHours: /* your value */,  // override only what changes
};
```
