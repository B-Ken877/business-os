# Configuration Reference — `roles-and-permissions-ui`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultRoleOnInvite` | `string` | `"member"` | Default role assigned when a new user is invited. |
| `allowOwnerRoleEditing` | `boolean` | `false` | Whether the owner role can be edited through this UI (default: no). |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/roles-and-permissions-ui/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultRoleOnInvite: /* your value */,  // override only what changes
};
```
