# Configuration Reference — `church-groups`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxGroupsPerTenant` | `number` | `100` | Cap on groups. |
| `defaultMaxMembers` | `number` | `30` | Default max members per group. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/churches/church-groups/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxGroupsPerTenant: /* your value */,  // override only what changes
};
```
