import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRegisterUserInput,
  validateLoginInput,
  validateChangePasswordInput,
} from "../backend/validation";

describe("identity / validateRegisterUserInput", () => {
  it("accepts a valid input", () => {
    const r = validateRegisterUserInput({
      email: "jean@example.com",
      fullName: "Jean",
      password: "very-strong-123",
    });
    expect(isOk(r)).toBe(true);
  });
  it("rejects invalid emails", () => {
    const r = validateRegisterUserInput({
      email: "not-an-email",
      fullName: "Jean",
      password: "very-strong-123",
    });
    expect(isErr(r)).toBe(true);
  });
  it("rejects empty full name", () => {
    const r = validateRegisterUserInput({
      email: "jean@example.com",
      fullName: "   ",
      password: "very-strong-123",
    });
    expect(isErr(r)).toBe(true);
  });
  it("rejects passwords shorter than 12 characters", () => {
    const r = validateRegisterUserInput({
      email: "jean@example.com",
      fullName: "Jean",
      password: "short123",
    });
    expect(isErr(r)).toBe(true);
  });
});

describe("identity / validateLoginInput", () => {
  it("accepts a valid input", () => {
    const r = validateLoginInput({
      email: "jean@example.com",
      password: "anything",
    });
    expect(isOk(r)).toBe(true);
  });
  it("rejects invalid emails", () => {
    const r = validateLoginInput({
      email: "nope",
      password: "anything",
    });
    expect(isErr(r)).toBe(true);
  });
});

describe("identity / validateChangePasswordInput", () => {
  it("accepts a valid input", () => {
    const r = validateChangePasswordInput({
      userId: "usr_1",
      currentPassword: "current-password-123",
      newPassword: "new-password-456",
    });
    expect(isOk(r)).toBe(true);
  });
  it("rejects when new equals current", () => {
    const r = validateChangePasswordInput({
      userId: "usr_1",
      currentPassword: "same-password-123",
      newPassword: "same-password-123",
    });
    expect(isErr(r)).toBe(true);
  });
  it("rejects weak new passwords", () => {
    const r = validateChangePasswordInput({
      userId: "usr_1",
      currentPassword: "current-password-123",
      newPassword: "short",
    });
    expect(isErr(r)).toBe(true);
  });
});
