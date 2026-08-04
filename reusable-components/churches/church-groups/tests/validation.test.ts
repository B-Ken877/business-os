import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateGroupInput,
  type CreateGroupInput,
  validateJoinGroupInput,
  type JoinGroupInput,
} from "../backend/validation";

describe("church-groups / validateCreateGroupInput", () => {
  it("accepts a valid input", () => {
    const input: CreateGroupInput = {
    name: "value",
    leaderMemberId: "value",
    maxMembers: 0,
    };
    const r = validateCreateGroupInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      leaderMemberId: "value",
      maxMembers: 0,
    } as any;
    const r = validateCreateGroupInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when leaderMemberId is missing", () => {
    const input = {
      name: "value",
      maxMembers: 0,
    } as any;
    const r = validateCreateGroupInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when maxMembers is missing", () => {
    const input = {
      name: "value",
      leaderMemberId: "value",
    } as any;
    const r = validateCreateGroupInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when maxMembers violates non-negative-integer", () => {
    const input = {
      name: "value",
      leaderMemberId: "value",
      maxMembers: -1,
    } as any;
    const r = validateCreateGroupInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("church-groups / validateJoinGroupInput", () => {
  it("accepts a valid input", () => {
    const input: JoinGroupInput = {
    groupId: "ent_test",
    memberId: "value",
    };
    const r = validateJoinGroupInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when groupId is missing", () => {
    const input = {
      memberId: "value",
    } as any;
    const r = validateJoinGroupInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when memberId is missing", () => {
    const input = {
      groupId: "ent_test",
    } as any;
    const r = validateJoinGroupInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
