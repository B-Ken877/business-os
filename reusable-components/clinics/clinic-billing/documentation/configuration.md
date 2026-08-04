# Configuration Reference — `clinic-billing`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultConsultationFeeCents` | `number` | `5000` | Default consultation fee. |
| `defaultCurrency` | `string` | `"HTG"` | Default currency. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-billing/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultConsultationFeeCents: /* your value */,  // override only what changes
};
```
