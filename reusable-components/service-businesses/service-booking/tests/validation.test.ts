import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateBookingInput,
  type CreateBookingInput,
  validateMarkCompletedInput,
  type MarkCompletedInput,
  validateMarkNoShowInput,
  type MarkNoShowInput,
} from "../backend/validation";

describe("service-booking / validateCreateBookingInput", () => {
  it("accepts a valid input", () => {
    const input: CreateBookingInput = {
    customerId: "ent_test",
    serviceId: "ent_test",
    staffUserId: "value",
    scheduledAt: "2024-01-15",
    durationMinutes: 1,
    };
    const r = validateCreateBookingInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerId is missing", () => {
    const input = {
      serviceId: "ent_test",
      staffUserId: "value",
      scheduledAt: "2024-01-15",
      durationMinutes: 1,
    } as any;
    const r = validateCreateBookingInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when serviceId is missing", () => {
    const input = {
      customerId: "ent_test",
      staffUserId: "value",
      scheduledAt: "2024-01-15",
      durationMinutes: 1,
    } as any;
    const r = validateCreateBookingInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when staffUserId is missing", () => {
    const input = {
      customerId: "ent_test",
      serviceId: "ent_test",
      scheduledAt: "2024-01-15",
      durationMinutes: 1,
    } as any;
    const r = validateCreateBookingInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scheduledAt is missing", () => {
    const input = {
      customerId: "ent_test",
      serviceId: "ent_test",
      staffUserId: "value",
      durationMinutes: 1,
    } as any;
    const r = validateCreateBookingInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when durationMinutes is missing", () => {
    const input = {
      customerId: "ent_test",
      serviceId: "ent_test",
      staffUserId: "value",
      scheduledAt: "2024-01-15",
    } as any;
    const r = validateCreateBookingInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scheduledAt violates iso-date", () => {
    const input = {
      customerId: "ent_test",
      serviceId: "ent_test",
      staffUserId: "value",
      scheduledAt: "not-a-date",
      durationMinutes: 1,
    } as any;
    const r = validateCreateBookingInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when durationMinutes violates positive-integer", () => {
    const input = {
      customerId: "ent_test",
      serviceId: "ent_test",
      staffUserId: "value",
      scheduledAt: "2024-01-15",
      durationMinutes: -1,
    } as any;
    const r = validateCreateBookingInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("service-booking / validateMarkCompletedInput", () => {
  it("accepts a valid input", () => {
    const input: MarkCompletedInput = {
    bookingId: "ent_test",
    };
    const r = validateMarkCompletedInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when bookingId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkCompletedInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("service-booking / validateMarkNoShowInput", () => {
  it("accepts a valid input", () => {
    const input: MarkNoShowInput = {
    bookingId: "ent_test",
    };
    const r = validateMarkNoShowInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when bookingId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkNoShowInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
