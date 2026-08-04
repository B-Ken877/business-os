import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateReservationInput,
  type CreateReservationInput,
  validateCancelReservationInput,
  type CancelReservationInput,
} from "../backend/validation";

describe("restaurant-reservations / validateCreateReservationInput", () => {
  it("accepts a valid input", () => {
    const input: CreateReservationInput = {
    customerName: "value",
    customerPhone: undefined,
    partySize: 1,
    scheduledAt: "2024-01-15",
    };
    const r = validateCreateReservationInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerName is missing", () => {
    const input = {
      customerPhone: undefined,
      partySize: 1,
      scheduledAt: "2024-01-15",
    } as any;
    const r = validateCreateReservationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when partySize is missing", () => {
    const input = {
      customerName: "value",
      customerPhone: undefined,
      scheduledAt: "2024-01-15",
    } as any;
    const r = validateCreateReservationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scheduledAt is missing", () => {
    const input = {
      customerName: "value",
      customerPhone: undefined,
      partySize: 1,
    } as any;
    const r = validateCreateReservationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when partySize violates positive-integer", () => {
    const input = {
      customerName: "value",
      customerPhone: undefined,
      partySize: -1,
      scheduledAt: "2024-01-15",
    } as any;
    const r = validateCreateReservationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scheduledAt violates iso-date", () => {
    const input = {
      customerName: "value",
      customerPhone: undefined,
      partySize: 1,
      scheduledAt: "not-a-date",
    } as any;
    const r = validateCreateReservationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-reservations / validateCancelReservationInput", () => {
  it("accepts a valid input", () => {
    const input: CancelReservationInput = {
    reservationId: "ent_test",
    };
    const r = validateCancelReservationInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when reservationId is missing", () => {
    const input = {
    } as any;
    const r = validateCancelReservationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
