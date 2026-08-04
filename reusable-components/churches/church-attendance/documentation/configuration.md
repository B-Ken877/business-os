# Configuration Reference — `church-attendance`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `declineThresholdWeeks` | `number` | `3` | Weeks of absence before flagging as declining. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/churches/church-attendance/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  declineThresholdWeeks: /* your value */,  // override only what changes
};
```
