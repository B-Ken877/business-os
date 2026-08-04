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
  InMemoryFormsAndIntakeStore,
  defineForm,
  publishForm,
  submitForm,
  defaultConfig,
  type FormDefinition,
  type FormSubmission,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryFormsAndIntakeStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "forms.define",
    "forms.publish",
    "forms.submit",
    "forms.readSubmissions",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("forms-and-intake / defineForm", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      defineForm(ctx, denyDeps, { slug: "value", title: "value", fieldsJson: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("forms-and-intake / publishForm", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      publishForm(ctx, denyDeps, { formId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("forms-and-intake / submitForm", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      submitForm(ctx, denyDeps, { formId: "ent_test", valuesJson: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("forms-and-intake / defineForm happy path", () => {
  it("defines a draft form", () => {
    const { ctx, deps } = setup();
    const r = defineForm(ctx, deps, {
      slug: "customer-intake",
      title: "Customer Intake",
      fieldsJson: JSON.stringify([
        { name: "fullName", type: "text", required: true },
        { name: "phone", type: "text", required: true },
      ]),
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("draft");
  });

  it("rejects invalid fieldsJson", () => {
    const { ctx, deps } = setup();
    const r = defineForm(ctx, deps, {
      slug: "bad",
      title: "Bad",
      fieldsJson: "not json",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("rejects duplicate slugs", () => {
    const { ctx, deps } = setup();
    defineForm(ctx, deps, {
      slug: "dup",
      title: "First",
      fieldsJson: "[]",
    });
    const r2 = defineForm(ctx, deps, {
      slug: "dup",
      title: "Second",
      fieldsJson: "[]",
    });
    expect(isErr(r2)).toBe(true);
    if (!r2.ok) expect(r2.error.code).toBe("CONFLICT");
  });
});

describe("forms-and-intake / publishForm + submitForm rules", () => {
  it("publishes a draft and accepts submissions", () => {
    const { ctx, deps } = setup();
    const def = defineForm(ctx, deps, {
      slug: "f1",
      title: "F1",
      fieldsJson: "[]",
    });
    if (!def.ok) throw new Error("setup failed");
    const pub = publishForm(ctx, deps, { formId: def.value.id });
    expect(isOk(pub)).toBe(true);
    const sub = submitForm(ctx, deps, {
      formId: def.value.id,
      valuesJson: JSON.stringify({ name: "Jean" }),
    });
    expect(isOk(sub)).toBe(true);
  });

  it("rejects submissions to draft forms", () => {
    const { ctx, deps } = setup();
    const def = defineForm(ctx, deps, {
      slug: "f2",
      title: "F2",
      fieldsJson: "[]",
    });
    if (!def.ok) throw new Error("setup failed");
    const sub = submitForm(ctx, deps, {
      formId: def.value.id,
      valuesJson: "{}",
    });
    expect(isErr(sub)).toBe(true);
    if (!sub.ok) expect(sub.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
