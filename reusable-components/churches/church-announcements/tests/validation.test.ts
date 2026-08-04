import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validatePublishAnnouncementInput,
  type PublishAnnouncementInput,
  validateListActiveAnnouncementsInput,
  type ListActiveAnnouncementsInput,
} from "../backend/validation";

describe("church-announcements / validatePublishAnnouncementInput", () => {
  it("accepts a valid input", () => {
    const input: PublishAnnouncementInput = {
    title: "value",
    body: "value",
    audience: "public",
    };
    const r = validatePublishAnnouncementInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when title is missing", () => {
    const input = {
      body: "value",
      audience: "public",
    } as any;
    const r = validatePublishAnnouncementInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when body is missing", () => {
    const input = {
      title: "value",
      audience: "public",
    } as any;
    const r = validatePublishAnnouncementInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when audience is missing", () => {
    const input = {
      title: "value",
      body: "value",
    } as any;
    const r = validatePublishAnnouncementInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when audience violates enum:public|members|staff", () => {
    const input = {
      title: "value",
      body: "value",
      audience: "__invalid__",
    } as any;
    const r = validatePublishAnnouncementInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("church-announcements / validateListActiveAnnouncementsInput", () => {
  it("accepts a valid input", () => {
    const input: ListActiveAnnouncementsInput = {
    audience: "public",
    };
    const r = validateListActiveAnnouncementsInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when audience is missing", () => {
    const input = {
    } as any;
    const r = validateListActiveAnnouncementsInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when audience violates enum:public|members|staff", () => {
    const input = {
      audience: "__invalid__",
    } as any;
    const r = validateListActiveAnnouncementsInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
