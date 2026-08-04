import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateTicketInput,
  type CreateTicketInput,
  validateMarkTicketReadyInput,
  type MarkTicketReadyInput,
  validateListTicketsForStationInput,
  type ListTicketsForStationInput,
} from "../backend/validation";

describe("restaurant-kitchen-display / validateCreateTicketInput", () => {
  it("accepts a valid input", () => {
    const input: CreateTicketInput = {
    orderId: "ent_test",
    itemsJson: "value",
    station: "value",
    priority: 0,
    };
    const r = validateCreateTicketInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when orderId is missing", () => {
    const input = {
      itemsJson: "value",
      station: "value",
      priority: 0,
    } as any;
    const r = validateCreateTicketInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when itemsJson is missing", () => {
    const input = {
      orderId: "ent_test",
      station: "value",
      priority: 0,
    } as any;
    const r = validateCreateTicketInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when station is missing", () => {
    const input = {
      orderId: "ent_test",
      itemsJson: "value",
      priority: 0,
    } as any;
    const r = validateCreateTicketInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when priority is missing", () => {
    const input = {
      orderId: "ent_test",
      itemsJson: "value",
      station: "value",
    } as any;
    const r = validateCreateTicketInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when priority violates non-negative-integer", () => {
    const input = {
      orderId: "ent_test",
      itemsJson: "value",
      station: "value",
      priority: -1,
    } as any;
    const r = validateCreateTicketInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-kitchen-display / validateMarkTicketReadyInput", () => {
  it("accepts a valid input", () => {
    const input: MarkTicketReadyInput = {
    ticketId: "ent_test",
    };
    const r = validateMarkTicketReadyInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when ticketId is missing", () => {
    const input = {
    } as any;
    const r = validateMarkTicketReadyInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("restaurant-kitchen-display / validateListTicketsForStationInput", () => {
  it("accepts a valid input", () => {
    const input: ListTicketsForStationInput = {
    station: "value",
    };
    const r = validateListTicketsForStationInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when station is missing", () => {
    const input = {
    } as any;
    const r = validateListTicketsForStationInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
