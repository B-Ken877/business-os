/**
 * Business logic for the forms-and-intake component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  FormDefinition,
  FormSubmission,
} from "./types";

import {
  type DefineFormInput,
  validateDefineFormInput,
  type PublishFormInput,
  validatePublishFormInput,
  type SubmitFormInput,
  validateSubmitFormInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface FormsAndIntakeStore {
  getFormDefinition(tenantId: string, id: EntityId): FormDefinition | undefined;
  putFormDefinition(tenantId: string, entity: FormDefinition): void;
  listFormDefinitions(tenantId: string): readonly FormDefinition[];
  deleteFormDefinition(tenantId: string, id: EntityId): boolean;
  getFormSubmission(tenantId: string, id: EntityId): FormSubmission | undefined;
  putFormSubmission(tenantId: string, entity: FormSubmission): void;
  listFormSubmissions(tenantId: string): readonly FormSubmission[];
  deleteFormSubmission(tenantId: string, id: EntityId): boolean;
}

export class InMemoryFormsAndIntakeStore implements FormsAndIntakeStore {
  private readonly formDefinitions = new Map<string, Map<string, FormDefinition>>();
  private readonly formSubmissions = new Map<string, Map<string, FormSubmission>>();

  getFormDefinition(tenantId: string, id: EntityId): FormDefinition | undefined {
    return this.formDefinitions.get(tenantId)?.get(id);
  }
  putFormDefinition(tenantId: string, entity: FormDefinition): void {
    let byId = this.formDefinitions.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.formDefinitions.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listFormDefinitions(tenantId: string): readonly FormDefinition[] {
    const byId = this.formDefinitions.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteFormDefinition(tenantId: string, id: EntityId): boolean {
    return this.formDefinitions.get(tenantId)?.delete(id) ?? false;
  }

  getFormSubmission(tenantId: string, id: EntityId): FormSubmission | undefined {
    return this.formSubmissions.get(tenantId)?.get(id);
  }
  putFormSubmission(tenantId: string, entity: FormSubmission): void {
    let byId = this.formSubmissions.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.formSubmissions.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listFormSubmissions(tenantId: string): readonly FormSubmission[] {
    const byId = this.formSubmissions.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteFormSubmission(tenantId: string, id: EntityId): boolean {
    return this.formSubmissions.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: FormsAndIntakeStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxFieldsPerForm: number;
  readonly maxSubmissionsPerForm: number;
}

//////////////////////////////////////////////////////////////////////
// defineForm — Define a new form.
//////////////////////////////////////////////////////////////////////
export function defineForm(
  ctx: TenantContext,
  deps: Dependencies,
  input: DefineFormInput
): Result<FormDefinition> {
  deps.permissions.require(ctx, asPermission("forms.define"));
  const validated = validateDefineFormInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Validate fieldsJson is valid JSON.
    try {
      const parsed = JSON.parse(v.fieldsJson);
      if (!Array.isArray(parsed)) {
        return err(ErrorCode.INVALID_INPUT, "fieldsJson must be a JSON array");
      }
      if (parsed.length > deps.config.maxFieldsPerForm) {
        return err(ErrorCode.LIMIT_EXCEEDED, "too many fields");
      }
    } catch {
      return err(ErrorCode.INVALID_INPUT, "fieldsJson is not valid JSON");
    }
    const existing = deps.store.listFormDefinitions(ctx.tenantId);
    if (existing.some((f) => f.slug === v.slug)) {
      return err(ErrorCode.CONFLICT, "form slug already exists");
    }
    const id = asEntityId("form_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const form: FormDefinition = {
      id,
      tenantId: ctx.tenantId,
      slug: v.slug,
      title: v.title,
      description: "",
      fieldsJson: v.fieldsJson,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putFormDefinition(ctx.tenantId, form);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "forms-and-intake",
      action: "form.defined",
      entityType: "form_definition",
      entityId: id,
      details: { slug: v.slug, title: v.title },
    }));
    return ok(form);
}

//////////////////////////////////////////////////////////////////////
// publishForm — Publish a draft form so it can accept submissions.
//////////////////////////////////////////////////////////////////////
export function publishForm(
  ctx: TenantContext,
  deps: Dependencies,
  input: PublishFormInput
): Result<FormDefinition> {
  deps.permissions.require(ctx, asPermission("forms.publish"));
  const validated = validatePublishFormInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.formId);
    const existing = deps.store.getFormDefinition(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "form not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "draft") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only draft forms can be published");
    }
    const updated: FormDefinition = {
      ...existing,
      status: "published",
      updatedAt: new Date().toISOString(),
    };
    deps.store.putFormDefinition(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "forms-and-intake",
      action: "form.published",
      entityType: "form_definition",
      entityId: id,
      details: { slug: existing.slug },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// submitForm — Submit values to a published form.
//////////////////////////////////////////////////////////////////////
export function submitForm(
  ctx: TenantContext,
  deps: Dependencies,
  input: SubmitFormInput
): Result<FormSubmission> {
  deps.permissions.require(ctx, asPermission("forms.submit"));
  const validated = validateSubmitFormInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.formId);
    const form = deps.store.getFormDefinition(ctx.tenantId, id);
    if (!form) {
      return err(ErrorCode.NOT_FOUND, "form not found");
    }
    assertSameTenant(ctx, form.tenantId);
    if (form.status !== "published") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "form is not published");
    }
    // Validate valuesJson is valid JSON.
    try {
      JSON.parse(v.valuesJson);
    } catch {
      return err(ErrorCode.INVALID_INPUT, "valuesJson is not valid JSON");
    }
    const submissions = deps.store.listFormSubmissions(ctx.tenantId)
      .filter((s) => s.formId === id);
    if (submissions.length >= deps.config.maxSubmissionsPerForm) {
      return err(ErrorCode.LIMIT_EXCEEDED, "submission limit reached");
    }
    const subId = asEntityId("sub_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const submission: FormSubmission = {
      id: subId,
      tenantId: ctx.tenantId,
      formId: id,
      valuesJson: v.valuesJson,
      submittedByUserId: ctx.userId,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putFormSubmission(ctx.tenantId, submission);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "forms-and-intake",
      action: "form.submitted",
      entityType: "form_submission",
      entityId: subId,
      details: { formId: id },
    }));
    return ok(submission);
}
