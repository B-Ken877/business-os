# Configuration Reference — `restaurant-reservations`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxReservationsPerDay` | `number` | `200` | Cap on reservations per day. |
| `reminderLeadMinutes` | `number` | `60` | Minutes before reservation to send a reminder. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-reservations/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxReservationsPerDay: /* your value */,  // override only what changes
};
```
