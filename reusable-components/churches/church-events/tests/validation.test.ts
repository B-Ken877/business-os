import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateEventInput,
  type CreateEventInput,
  validateRegisterForMemberInput,
  type RegisterForMemberInput,
} from "../backend/validation";

describe("church-events / validateCreateEventInput", () => {
  it("accepts a valid input", () => {
    const input: CreateEventInput = {
    name: "value",
    startsAt: "2024-01-15",
    endsAt: "2024-01-15",
    location: undefined,
    capacity: 0,
    };
    const r = validateCreateEventInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
      location: undefined,
      capacity: 0,
    } as any;
    const r = validateCreateEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startsAt is missing", () => {
    const input = {
      name: "value",
      endsAt: "2024-01-15",
      location: undefined,
      capacity: 0,
    } as any;
    const r = validateCreateEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endsAt is missing", () => {
    const input = {
      name: "value",
      startsAt: "2024-01-15",
      location: undefined,
      capacity: 0,
    } as any;
    const r = validateCreateEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when capacity is missing", () => {
    const input = {
      name: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
      location: undefined,
    } as any;
    const r = validateCreateEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when startsAt violates iso-date", () => {
    const input = {
      name: "value",
      startsAt: "not-a-date",
      endsAt: "2024-01-15",
      location: undefined,
      capacity: 0,
    } as any;
    const r = validateCreateEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when endsAt violates iso-date", () => {
    const input = {
      name: "value",
      startsAt: "2024-01-15",
      endsAt: "not-a-date",
      location: undefined,
      capacity: 0,
    } as any;
    const r = validateCreateEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when capacity violates non-negative-integer", () => {
    const input = {
      name: "value",
      startsAt: "2024-01-15",
      endsAt: "2024-01-15",
      location: undefined,
      capacity: -1,
    } as any;
    const r = validateCreateEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("church-events / validateRegisterForMemberInput", () => {
  it("accepts a valid input", () => {
    const input: RegisterForMemberInput = {
    eventId: "ent_test",
    memberId: "value",
    };
    const r = validateRegisterForMemberInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when eventId is missing", () => {
    const input = {
      memberId: "value",
    } as any;
    const r = validateRegisterForMemberInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when memberId is missing", () => {
    const input = {
      eventId: "ent_test",
    } as any;
    const r = validateRegisterForMemberInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
