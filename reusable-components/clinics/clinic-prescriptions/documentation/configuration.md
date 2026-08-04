# Configuration Reference — `clinic-prescriptions`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxRefillsAllowed` | `number` | `3` | Default max refills per prescription. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-prescriptions/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxRefillsAllowed: /* your value */,  // override only what changes
};
```
