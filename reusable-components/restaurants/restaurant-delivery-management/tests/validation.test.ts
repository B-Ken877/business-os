import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateAssignDriverInput,
  type AssignDriverInput,
  validateConfirmDeliveredInput,
  type ConfirmDeliveredInput,
} from "../backend/validation";

describe("restaurant-delivery-management / validateAssignDriverInput", () => {
  it("accepts a valid input", () => {
    const input: AssignDriverInput = {
    deliveryId: "ent_test",
    driverId: "value",
    };
    const r = validateAssignDriverInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when deliveryId is missing", () => {
    const input = {
      driverId: "value",
    } as any;
    const r = validateAssignDriverInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when driverId is missing", () => {
    const input = {
      deliveryId: "ent_test",
    } as any;
    const r = validateAssignDriverInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-delivery-management / validateConfirmDeliveredInput", () => {
  it("accepts a valid input", () => {
    const input: ConfirmDeliveredInput = {
    deliveryId: "ent_test",
    };
    const r = validateConfirmDeliveredInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when deliveryId is missing", () => {
    const input = {
    } as any;
    const r = validateConfirmDeliveredInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
