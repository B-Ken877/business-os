import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateSendMessageInput,
  type SendMessageInput,
  validateMarkDeliveredInput,
  type MarkDeliveredInput,
} from "../backend/validation";

describe("messaging-center / validateSendMessageInput", () => {
  it("accepts a valid input", () => {
    const input: SendMessageInput = {
    recipientId: "value",
    channel: "in_app",
    templateKey: "value",
    body: "value",
    };
    const r = validateSendMessageInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when recipientId is missing", () => {
    const input = {
      channel: "in_app",
      templateKey: "value",
      body: "value",
    } as any;
    const r = validateSendMessageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when channel is missing", () => {
    const input = {
      recipientId: "value",
      templateKey: "value",
      body: "value",
    } as any;
    const r = validateSendMessageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when templateKey is missing", () => {
    const input = {
      recipientId: "value",
      channel: "in_app",
      body: "value",
    } as any;
    const r = validateSendMessageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when body is missing", () => {
    const input = {
      recipientId: "value",
      channel: "in_app",
      templateKey: "value",
    } as any;
    const r = validateSendMessageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when channel violates enum:in_app|sms|email|whatsapp", () => {
    const input = {
      recipientId: "value",
      channel: "__invalid__",
      templateKey: "value",
      body: "value",
    } as any;
    const r = validateSendMessageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("messaging-center / validateMarkDeliveredInput", () => {
  it("accepts a valid input", () => {
    const input: MarkDeliveredInput = {
    messageId: "ent_test",
    };
    const r = validateMarkDeliveredInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when messageId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkDeliveredInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
