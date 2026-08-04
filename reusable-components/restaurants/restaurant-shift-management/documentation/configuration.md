# Configuration Reference — `restaurant-shift-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `minShiftNoticeMinutes` | `number` | `60` | Minimum notice for shift changes. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-shift-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  minShiftNoticeMinutes: /* your value */,  // override only what changes
};
```
