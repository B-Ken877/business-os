import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateSubmitFeedbackInput,
  type SubmitFeedbackInput,
} from "../backend/validation";

describe("service-feedback / validateSubmitFeedbackInput", () => {
  it("accepts a valid input", () => {
    const input: SubmitFeedbackInput = {
    customerId: "ent_test",
    bookingId: "ent_test",
    rating: 1,
    comment: undefined,
    };
    const r = validateSubmitFeedbackInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerId is missing", () => {
    const input = {
      bookingId: "ent_test",
      rating: 1,
      comment: undefined,
    } as any;
    const r = validateSubmitFeedbackInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when bookingId is missing", () => {
    const input = {
      customerId: "ent_test",
      rating: 1,
      comment: undefined,
    } as any;
    const r = validateSubmitFeedbackInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when rating is missing", () => {
    const input = {
      customerId: "ent_test",
      bookingId: "ent_test",
      comment: undefined,
    } as any;
    const r = validateSubmitFeedbackInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when rating violates positive-integer", () => {
    const input = {
      customerId: "ent_test",
      bookingId: "ent_test",
      rating: -1,
      comment: undefined,
    } as any;
    const r = validateSubmitFeedbackInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
