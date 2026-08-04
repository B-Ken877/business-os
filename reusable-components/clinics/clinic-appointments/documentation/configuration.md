# Configuration Reference — `clinic-appointments`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `slotDurationMinutes` | `number` | `30` | Default appointment slot length. |
| `reminderLeadMinutes` | `number` | `60` | Minutes before appointment to send a reminder. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-appointments/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  slotDurationMinutes: /* your value */,  // override only what changes
};
```
