import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateMemberInput,
  type CreateMemberInput,
  validateUpdateOwnVisibilityInput,
  type UpdateOwnVisibilityInput,
} from "../backend/validation";

describe("church-member-management / validateCreateMemberInput", () => {
  it("accepts a valid input", () => {
    const input: CreateMemberInput = {
    firstName: "value",
    lastName: "value",
    phone: undefined,
    email: undefined,
    familyId: undefined,
    directoryVisibility: "visible",
    };
    const r = validateCreateMemberInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when firstName is missing", () => {
    const input = {
      lastName: "value",
      phone: undefined,
      email: undefined,
      familyId: undefined,
      directoryVisibility: "visible",
    } as any;
    const r = validateCreateMemberInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when lastName is missing", () => {
    const input = {
      firstName: "value",
      phone: undefined,
      email: undefined,
      familyId: undefined,
      directoryVisibility: "visible",
    } as any;
    const r = validateCreateMemberInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when directoryVisibility is missing", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      phone: undefined,
      email: undefined,
      familyId: undefined,
    } as any;
    const r = validateCreateMemberInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when directoryVisibility violates enum:visible|hidden", () => {
    const input = {
      firstName: "value",
      lastName: "value",
      phone: undefined,
      email: undefined,
      familyId: undefined,
      directoryVisibility: "__invalid__",
    } as any;
    const r = validateCreateMemberInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("church-member-management / validateUpdateOwnVisibilityInput", () => {
  it("accepts a valid input", () => {
    const input: UpdateOwnVisibilityInput = {
    memberId: "ent_test",
    visibility: "visible",
    };
    const r = validateUpdateOwnVisibilityInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when memberId is missing", () => {
    const input = {
      visibility: "visible",
    } as any;
    const r = validateUpdateOwnVisibilityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when visibility is missing", () => {
    const input = {
      memberId: "ent_test",
    } as any;
    const r = validateUpdateOwnVisibilityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when visibility violates enum:visible|hidden", () => {
    const input = {
      memberId: "ent_test",
      visibility: "__invalid__",
    } as any;
    const r = validateUpdateOwnVisibilityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
