import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryRetailBarcodeScanningStore,
  registerBarcode,
  lookupBarcode,
  defaultConfig,
  type Barcode,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRetailBarcodeScanningStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "retail.barcodes.register",
    "retail.barcodes.lookup",
    "retail.barcodes.remove",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("retail-barcode-scanning / registerBarcode", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      registerBarcode(ctx, denyDeps, { code: "value", format: "value", productId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-barcode-scanning / lookupBarcode", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      lookupBarcode(ctx, denyDeps, { code: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-barcode-scanning / registerBarcode + lookupBarcode happy path", () => {
  it("registers a barcode and looks it up", () => {
    const { ctx, deps } = setup();
    const r = registerBarcode(ctx, deps, {
      code: "7501234567890",
      format: "ean13",
      productId: "ent_p1",
    });
    expect(isOk(r)).toBe(true);
    const l = lookupBarcode(ctx, deps, { code: "7501234567890" });
    expect(isOk(l)).toBe(true);
    if (!l.ok) return;
    expect(l.value.productId).toBe("ent_p1");
  });

  it("rejects registering the same barcode to a different product", () => {
    const { ctx, deps } = setup();
    registerBarcode(ctx, deps, { code: "X", format: "qr", productId: "ent_p1" });
    const r = registerBarcode(ctx, deps, { code: "X", format: "qr", productId: "ent_p2" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });

  it("rejects re-registering the same barcode to the same product", () => {
    const { ctx, deps } = setup();
    registerBarcode(ctx, deps, { code: "X", format: "qr", productId: "ent_p1" });
    const r = registerBarcode(ctx, deps, { code: "X", format: "qr", productId: "ent_p1" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });

  it("returns NOT_FOUND for unknown barcodes", () => {
    const { ctx, deps } = setup();
    const r = lookupBarcode(ctx, deps, { code: "unknown" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });
});
