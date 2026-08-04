import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRecordTriageInput,
  type RecordTriageInput,
} from "../backend/validation";

describe("clinic-triage / validateRecordTriageInput", () => {
  it("accepts a valid input", () => {
    const input: RecordTriageInput = {
    patientId: "ent_test",
    visitReason: "value",
    symptomsJson: undefined,
    urgency: "low",
    };
    const r = validateRecordTriageInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      visitReason: "value",
      symptomsJson: undefined,
      urgency: "low",
    } as any;
    const r = validateRecordTriageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when visitReason is missing", () => {
    const input = {
      patientId: "ent_test",
      symptomsJson: undefined,
      urgency: "low",
    } as any;
    const r = validateRecordTriageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when urgency is missing", () => {
    const input = {
      patientId: "ent_test",
      visitReason: "value",
      symptomsJson: undefined,
    } as any;
    const r = validateRecordTriageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when urgency violates enum:low|medium|high|emergency", () => {
    const input = {
      patientId: "ent_test",
      visitReason: "value",
      symptomsJson: undefined,
      urgency: "__invalid__",
    } as any;
    const r = validateRecordTriageInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
