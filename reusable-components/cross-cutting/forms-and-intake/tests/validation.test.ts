import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateDefineFormInput,
  type DefineFormInput,
  validatePublishFormInput,
  type PublishFormInput,
  validateSubmitFormInput,
  type SubmitFormInput,
} from "../backend/validation";

describe("forms-and-intake / validateDefineFormInput", () => {
  it("accepts a valid input", () => {
    const input: DefineFormInput = {
    slug: "value",
    title: "value",
    fieldsJson: "value",
    };
    const r = validateDefineFormInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when slug is missing", () => {
    const input = {
      title: "value",
      fieldsJson: "value",
    } as any;
    const r = validateDefineFormInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when title is missing", () => {
    const input = {
      slug: "value",
      fieldsJson: "value",
    } as any;
    const r = validateDefineFormInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when fieldsJson is missing", () => {
    const input = {
      slug: "value",
      title: "value",
    } as any;
    const r = validateDefineFormInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("forms-and-intake / validatePublishFormInput", () => {
  it("accepts a valid input", () => {
    const input: PublishFormInput = {
    formId: "ent_test",
    };
    const r = validatePublishFormInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when formId is missing", () => {
    const input = {
    } as any;
    const r = validatePublishFormInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("forms-and-intake / validateSubmitFormInput", () => {
  it("accepts a valid input", () => {
    const input: SubmitFormInput = {
    formId: "ent_test",
    valuesJson: "value",
    };
    const r = validateSubmitFormInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when formId is missing", () => {
    const input = {
      valuesJson: "value",
    } as any;
    const r = validateSubmitFormInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when valuesJson is missing", () => {
    const input = {
      formId: "ent_test",
    } as any;
    const r = validateSubmitFormInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
