import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateSendParentMessageInput,
  type SendParentMessageInput,
  validateListMessagesForStudentInput,
  type ListMessagesForStudentInput,
} from "../backend/validation";

describe("school-parent-communication / validateSendParentMessageInput", () => {
  it("accepts a valid input", () => {
    const input: SendParentMessageInput = {
    studentId: "ent_test",
    subject: "value",
    body: "value",
    };
    const r = validateSendParentMessageInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
      subject: "value",
      body: "value",
    } as any;
    const r = validateSendParentMessageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when subject is missing", () => {
    const input = {
      studentId: "ent_test",
      body: "value",
    } as any;
    const r = validateSendParentMessageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when body is missing", () => {
    const input = {
      studentId: "ent_test",
      subject: "value",
    } as any;
    const r = validateSendParentMessageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("school-parent-communication / validateListMessagesForStudentInput", () => {
  it("accepts a valid input", () => {
    const input: ListMessagesForStudentInput = {
    studentId: "ent_test",
    };
    const r = validateListMessagesForStudentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when studentId is missing", () => {
    const input = {
    } as any;
    const r = validateListMessagesForStudentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
