# Configuration Reference — `retail-barcode-scanning`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `allowUnknownBarcodeCreate` | `boolean` | `false` | Whether scanning an unknown barcode can trigger product creation. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/retail-shops/retail-barcode-scanning/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  allowUnknownBarcodeCreate: /* your value */,  // override only what changes
};
```
