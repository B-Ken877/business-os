# Configuration Reference — `clinic-consent`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `requireExplicitRevokeReason` | `boolean` | `true` | Whether revocation requires a reason. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-consent/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  requireExplicitRevokeReason: /* your value */,  // override only what changes
};
```
