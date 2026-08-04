import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRecordEventInput,
  type RecordEventInput,
  validateListEventsForEntityInput,
  type ListEventsForEntityInput,
} from "../backend/validation";

describe("activity-timeline / validateRecordEventInput", () => {
  it("accepts a valid input", () => {
    const input: RecordEventInput = {
    entityType: "value",
    entityId: "ent_test",
    action: "value",
    summary: "value",
    occurredAt: "2024-01-15",
    };
    const r = validateRecordEventInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when entityType is missing", () => {
    const input = {
      entityId: "ent_test",
      action: "value",
      summary: "value",
      occurredAt: "2024-01-15",
    } as any;
    const r = validateRecordEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityId is missing", () => {
    const input = {
      entityType: "value",
      action: "value",
      summary: "value",
      occurredAt: "2024-01-15",
    } as any;
    const r = validateRecordEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when action is missing", () => {
    const input = {
      entityType: "value",
      entityId: "ent_test",
      summary: "value",
      occurredAt: "2024-01-15",
    } as any;
    const r = validateRecordEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when summary is missing", () => {
    const input = {
      entityType: "value",
      entityId: "ent_test",
      action: "value",
      occurredAt: "2024-01-15",
    } as any;
    const r = validateRecordEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when occurredAt is missing", () => {
    const input = {
      entityType: "value",
      entityId: "ent_test",
      action: "value",
      summary: "value",
    } as any;
    const r = validateRecordEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when occurredAt violates iso-date", () => {
    const input = {
      entityType: "value",
      entityId: "ent_test",
      action: "value",
      summary: "value",
      occurredAt: "not-a-date",
    } as any;
    const r = validateRecordEventInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("activity-timeline / validateListEventsForEntityInput", () => {
  it("accepts a valid input", () => {
    const input: ListEventsForEntityInput = {
    entityType: "value",
    entityId: "ent_test",
    };
    const r = validateListEventsForEntityInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when entityType is missing", () => {
    const input = {
      entityId: "ent_test",
    } as any;
    const r = validateListEventsForEntityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityId is missing", () => {
    const input = {
      entityType: "value",
    } as any;
    const r = validateListEventsForEntityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
