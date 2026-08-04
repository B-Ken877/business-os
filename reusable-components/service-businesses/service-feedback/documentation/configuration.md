# Configuration Reference — `service-feedback`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `minRatingForGood` | `number` | `4` | Rating threshold for 'good' feedback. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/service-businesses/service-feedback/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  minRatingForGood: /* your value */,  // override only what changes
};
```
