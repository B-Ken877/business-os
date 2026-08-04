# Configuration Reference — `church-member-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultDirectoryVisibility` | `string` | `"visible"` | Default visibility of a new member in the directory. |
| `maxMembersPerTenant` | `number` | `50000` | Cap on member records. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/churches/church-member-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultDirectoryVisibility: /* your value */,  // override only what changes
};
```
