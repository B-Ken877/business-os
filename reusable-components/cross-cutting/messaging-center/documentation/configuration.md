# Configuration Reference — `messaging-center`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultChannel` | `string` | `"in_app"` | Channel used when the caller does not specify one. |
| `maxBroadcastRecipients` | `number` | `500` | Hard cap on recipients per broadcast. |
| `rateLimitPerMinute` | `number` | `60` | Max messages per tenant per minute. |
| `retryFailedDeliveries` | `boolean` | `true` | Whether to retry failed deliveries up to the channel's limit. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/messaging-center/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultChannel: /* your value */,  // override only what changes
};
```
