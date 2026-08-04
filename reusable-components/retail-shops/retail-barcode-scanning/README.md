# Retail Barcode Scanning

> Barcode lookup and scanning workflows.

**Component ID:** `retail-barcode-scanning`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Provide the lookup layer between a scanned barcode (EAN, UPC, QR) and the product in the catalog. The actual scanning hardware is handled by the UI layer; this component resolves the scanned string to a product id.

## Business problem solved

Without a barcode lookup, cashiers type SKUs manually — slow and error-prone. This component makes 'scan → product' a single API call, with fallback for unknown barcodes.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Lookup a product by its barcode
- Register a barcode against a product (one product, multiple barcodes)
- Resolve scanned input (auto-detect format)
- Per-tenant isolation

## Dependencies

- `@business-os/shared`
- `retail-product-catalog`

## Configuration options

- `allowUnknownBarcodeCreate` (`boolean`, default `false`) — Whether scanning an unknown barcode can trigger product creation.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.barcodes.register`
- `retail.barcodes.lookup`
- `retail.barcodes.remove`

## Data handled

Barcode strings, product references. Not sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No actual scanning hardware integration — the UI layer captures the scan and passes the string here.
- No format validation — the declared format is trusted.

## Future improvements

- Format validation (validate EAN-13 checksum, etc.).
- Bulk barcode import.
- Auto-create product from barcode lookup against a global product database.

---

## Folder layout

```
retail-barcode-scanning/
├── README.md                  (this file)
├── component.json             (machine-readable manifest)
├── documentation/
│   ├── contract.md            (API contract)
│   └── configuration.md       (config reference)
├── backend/
│   ├── types.ts               (domain types — the canonical contract)
│   ├── validation.ts          (input validation helpers)
│   ├── logic.ts               (operations + permission/audit enforcement)
│   └── index.ts               (public barrel)
├── database/
│   └── schema.ts              (data model — types only, no DB adapter yet)
├── api/
│   └── contract.ts            (HTTP-shaped contract — types only)
├── config/
│   ├── schema.ts              (config schema)
│   └── defaults.ts            (default values)
├── tests/
│   ├── logic.test.ts          (happy path + business rules)
│   ├── validation.test.ts     (input validation)
│   └── tenant-isolation.test.ts (cross-tenant access denial)
└── examples/
    └── basic-usage.ts
```
