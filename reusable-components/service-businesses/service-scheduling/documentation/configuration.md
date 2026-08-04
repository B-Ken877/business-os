# Configuration Reference — `service-scheduling`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultWorkingStartHour` | `number` | `9` | Default working start hour. |
| `defaultWorkingEndHour` | `number` | `17` | Default working end hour. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/service-businesses/service-scheduling/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultWorkingStartHour: /* your value */,  // override only what changes
};
```
