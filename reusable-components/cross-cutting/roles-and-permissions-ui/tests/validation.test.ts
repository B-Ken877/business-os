import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateDefineRoleInput,
  type DefineRoleInput,
  validateListPermissionsForRoleInput,
  type ListPermissionsForRoleInput,
} from "../backend/validation";

describe("roles-and-permissions-ui / validateDefineRoleInput", () => {
  it("accepts a valid input", () => {
    const input: DefineRoleInput = {
    name: "value",
    description: undefined,
    permissionsJson: "value",
    };
    const r = validateDefineRoleInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      description: undefined,
      permissionsJson: "value",
    } as any;
    const r = validateDefineRoleInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when permissionsJson is missing", () => {
    const input = {
      name: "value",
      description: undefined,
    } as any;
    const r = validateDefineRoleInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("roles-and-permissions-ui / validateListPermissionsForRoleInput", () => {
  it("accepts a valid input", () => {
    const input: ListPermissionsForRoleInput = {
    roleName: "value",
    };
    const r = validateListPermissionsForRoleInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when roleName is missing", () => {
    const input = {
    } as any;
    const r = validateListPermissionsForRoleInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
