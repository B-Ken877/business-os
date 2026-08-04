import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateVolunteerInput,
  type CreateVolunteerInput,
  validateAssignVolunteerInput,
  type AssignVolunteerInput,
} from "../backend/validation";

describe("church-volunteers / validateCreateVolunteerInput", () => {
  it("accepts a valid input", () => {
    const input: CreateVolunteerInput = {
    memberId: "value",
    role: "value",
    };
    const r = validateCreateVolunteerInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when memberId is missing", () => {
    const input = {
      role: "value",
    } as any;
    const r = validateCreateVolunteerInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when role is missing", () => {
    const input = {
      memberId: "value",
    } as any;
    const r = validateCreateVolunteerInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("church-volunteers / validateAssignVolunteerInput", () => {
  it("accepts a valid input", () => {
    const input: AssignVolunteerInput = {
    volunteerId: "ent_test",
    assignmentType: "value",
    assignmentId: "ent_test",
    };
    const r = validateAssignVolunteerInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when volunteerId is missing", () => {
    const input = {
      assignmentType: "value",
      assignmentId: "ent_test",
    } as any;
    const r = validateAssignVolunteerInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when assignmentType is missing", () => {
    const input = {
      volunteerId: "ent_test",
      assignmentId: "ent_test",
    } as any;
    const r = validateAssignVolunteerInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when assignmentId is missing", () => {
    const input = {
      volunteerId: "ent_test",
      assignmentType: "value",
    } as any;
    const r = validateAssignVolunteerInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
