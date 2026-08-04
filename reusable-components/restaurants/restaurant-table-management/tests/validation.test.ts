import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateTableInput,
  type CreateTableInput,
  validateAssignOrderToTableInput,
  type AssignOrderToTableInput,
  validateReleaseTableInput,
  type ReleaseTableInput,
} from "../backend/validation";

describe("restaurant-table-management / validateCreateTableInput", () => {
  it("accepts a valid input", () => {
    const input: CreateTableInput = {
    label: "value",
    seats: 1,
    };
    const r = validateCreateTableInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when label is missing", () => {
    const input = {
      seats: 1,
    } as any;
    const r = validateCreateTableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when seats is missing", () => {
    const input = {
      label: "value",
    } as any;
    const r = validateCreateTableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when seats violates positive-integer", () => {
    const input = {
      label: "value",
      seats: -1,
    } as any;
    const r = validateCreateTableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-table-management / validateAssignOrderToTableInput", () => {
  it("accepts a valid input", () => {
    const input: AssignOrderToTableInput = {
    tableId: "ent_test",
    orderId: "ent_test",
    };
    const r = validateAssignOrderToTableInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when tableId is missing", () => {
    const input = {
      orderId: "ent_test",
    } as any;
    const r = validateAssignOrderToTableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when orderId is missing", () => {
    const input = {
      tableId: "ent_test",
    } as any;
    const r = validateAssignOrderToTableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-table-management / validateReleaseTableInput", () => {
  it("accepts a valid input", () => {
    const input: ReleaseTableInput = {
    tableId: "ent_test",
    };
    const r = validateReleaseTableInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when tableId is missing", () => {
    const input = {
    } as any;
    const r = validateReleaseTableInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
