import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validatePushNotificationInput,
  type PushNotificationInput,
  validateMarkReadInput,
  type MarkReadInput,
} from "../backend/validation";

describe("notifications-center / validatePushNotificationInput", () => {
  it("accepts a valid input", () => {
    const input: PushNotificationInput = {
    recipientUserId: "value",
    title: "value",
    body: "value",
    actionLabel: undefined,
    actionUrl: undefined,
    };
    const r = validatePushNotificationInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when recipientUserId is missing", () => {
    const input = {
      title: "value",
      body: "value",
      actionLabel: undefined,
      actionUrl: undefined,
    } as any;
    const r = validatePushNotificationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when title is missing", () => {
    const input = {
      recipientUserId: "value",
      body: "value",
      actionLabel: undefined,
      actionUrl: undefined,
    } as any;
    const r = validatePushNotificationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when body is missing", () => {
    const input = {
      recipientUserId: "value",
      title: "value",
      actionLabel: undefined,
      actionUrl: undefined,
    } as any;
    const r = validatePushNotificationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("notifications-center / validateMarkReadInput", () => {
  it("accepts a valid input", () => {
    const input: MarkReadInput = {
    notificationId: "ent_test",
    };
    const r = validateMarkReadInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when notificationId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkReadInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
