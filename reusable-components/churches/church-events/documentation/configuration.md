# Configuration Reference — `church-events`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultCapacity` | `number` | `200` | Default event capacity. |
| `allowOverRegistration` | `boolean` | `false` | Whether to allow registration beyond capacity. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/churches/church-events/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultCapacity: /* your value */,  // override only what changes
};
```
