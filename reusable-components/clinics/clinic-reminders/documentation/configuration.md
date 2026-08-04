# Configuration Reference — `clinic-reminders`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultReminderLeadMinutes` | `number` | `60` | Default minutes before the event to send a reminder. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-reminders/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultReminderLeadMinutes: /* your value */,  // override only what changes
};
```
