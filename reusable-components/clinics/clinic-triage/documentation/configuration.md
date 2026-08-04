# Configuration Reference — `clinic-triage`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `emergencyAutoNotify` | `boolean` | `true` | Whether emergency triage automatically triggers a notification. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-triage/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  emergencyAutoNotify: /* your value */,  // override only what changes
};
```
